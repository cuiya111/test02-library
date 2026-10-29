const router = require('express').Router()
const pool = require('../db')

// 学生列表（下划线字段用别名转驼峰，前端可直接使用）
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, student_no AS studentNo, major, class_name AS className,
              phone, created_at AS createdAt
       FROM students ORDER BY id`
    )
    res.json({ code: 200, data: rows })
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message })
  }
})

// 新增学生（POST /api/students）
router.post('/', async (req, res) => {
  const { name, studentNo, major, className, phone } = req.body
  if (!name || !studentNo) {
    return res.status(400).json({ code: 400, msg: '姓名和学号必填' })
  }
  try {
    const [r] = await pool.query(
      'INSERT INTO students (name, student_no, major, class_name, phone) VALUES (?, ?, ?, ?, ?)',
      [name, studentNo, major || null, className || null, phone || null]
    )
    res.json({ code: 200, data: { id: r.insertId } })
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ code: 409, msg: '该学号已存在' })
    res.status(500).json({ code: 500, msg: e.message })
  }
})

// 更新学生（PUT /api/students/update，id 放 body，不进 URL）
router.put('/update', async (req, res) => {
  const { id, name, studentNo, major, className, phone } = req.body
  if (!id || !name || !studentNo) {
    return res.status(400).json({ code: 400, msg: '参数错误：id、姓名、学号必填' })
  }
  try {
    const [r] = await pool.query(
      'UPDATE students SET name=?, student_no=?, major=?, class_name=?, phone=? WHERE id=?',
      [name, studentNo, major || null, className || null, phone || null, id]
    )
    if (r.affectedRows === 0) return res.status(404).json({ code: 404, msg: '学生不存在' })
    res.json({ code: 200, msg: '更新成功' })
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ code: 409, msg: '该学号已存在' })
    res.status(500).json({ code: 500, msg: e.message })
  }
})

// 删除学生（DELETE /api/students/delete/:id）
// 存在未归还借阅时不允许删除（事务内校验）
router.delete('/delete/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!id) return res.status(400).json({ code: 400, msg: '参数错误' })
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [b] = await conn.query(
      'SELECT COUNT(*) AS c FROM borrows WHERE student_id=? AND return_time IS NULL',
      [id]
    )
    if (b[0].c > 0) {
      await conn.rollback()
      return res.status(409).json({ code: 409, msg: '该学生存在未归还的借阅，无法删除' })
    }
    const [r] = await conn.query('DELETE FROM students WHERE id=?', [id])
    if (r.affectedRows === 0) {
      await conn.rollback()
      return res.status(404).json({ code: 404, msg: '学生不存在' })
    }
    await conn.commit()
    res.json({ code: 200, msg: '删除成功' })
  } catch (e) {
    await conn.rollback()
    res.status(500).json({ code: 500, msg: e.message })
  } finally {
    conn.release()
  }
})

module.exports = router
