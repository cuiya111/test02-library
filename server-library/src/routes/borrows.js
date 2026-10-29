const router = require('express').Router()
const pool = require('../db')

// 借阅记录列表（联表带出学生/书名/学号，并计算是否逾期）
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.id,
              b.student_id AS studentId, s.name AS studentName, s.student_no AS studentNo,
              b.book_id   AS bookId,   bk.title AS bookTitle,
              b.borrow_time AS borrowTime, b.due_time AS dueTime, b.return_time AS returnTime,
              (b.return_time IS NULL AND b.due_time < NOW()) AS isOverdue
       FROM borrows b
       LEFT JOIN students s ON b.student_id = s.id
       LEFT JOIN books bk ON b.book_id = bk.id
       ORDER BY b.id DESC`
    )
    res.json({ code: 200, data: rows })
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message })
  }
})

// 办理借书（POST /api/borrows，body: { studentId, bookId, dueDays }）
// 事务：扣减可借库存 + 插入借阅记录，任一失败整体回滚
router.post('/', async (req, res) => {
  const studentId = Number(req.body.studentId)
  const bookId = Number(req.body.bookId)
  const dueDays = Number(req.body.dueDays || 30)
  if (!studentId || !bookId) {
    return res.status(400).json({ code: 400, msg: '请选择借阅学生和图书' })
  }
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // 1) 尝试扣减库存（available>0 才扣，否则影响 0 行）
    const [upd] = await conn.query(
      'UPDATE books SET available = available - 1 WHERE id = ? AND available > 0',
      [bookId]
    )
    if (upd.affectedRows === 0) {
      await conn.rollback()
      return res.status(409).json({ code: 409, msg: '该图书无可借库存' })
    }

    // 2) 插入借阅记录，应还时间 = 借出时间 + dueDays 天
    const [ins] = await conn.query(
      `INSERT INTO borrows (student_id, book_id, borrow_time, due_time)
       VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY))`,
      [studentId, bookId, dueDays]
    )

    await conn.commit()
    res.json({ code: 200, data: { id: ins.insertId } })
  } catch (e) {
    await conn.rollback()
    res.status(500).json({ code: 500, msg: e.message })
  } finally {
    conn.release()
  }
})

// 归还图书（POST /api/borrows/return，body: { borrowId }）
// 事务：更新归还时间 + 恢复库存
router.post('/return', async (req, res) => {
  const borrowId = Number(req.body.borrowId)
  if (!borrowId) return res.status(400).json({ code: 400, msg: '参数错误' })
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // 1) 取该条未归还记录的图书 id
    const [rows] = await conn.query(
      'SELECT book_id AS bookId FROM borrows WHERE id = ? AND return_time IS NULL',
      [borrowId]
    )
    if (rows.length === 0) {
      await conn.rollback()
      return res.status(409).json({ code: 409, msg: '该借阅记录不存在或已归还' })
    }

    // 2) 标记归还
    await conn.query('UPDATE borrows SET return_time = NOW() WHERE id = ?', [borrowId])

    // 3) 恢复库存（不超过总库存）
    await conn.query(
      'UPDATE books SET available = LEAST(total, available + 1) WHERE id = ?',
      [rows[0].bookId]
    )

    await conn.commit()
    res.json({ code: 200, msg: '归还成功' })
  } catch (e) {
    await conn.rollback()
    res.status(500).json({ code: 500, msg: e.message })
  } finally {
    conn.release()
  }
})

module.exports = router
