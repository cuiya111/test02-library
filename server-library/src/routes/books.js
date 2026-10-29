const router = require('express').Router()
const pool = require('../db')

// 图书列表
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, author, isbn, category, publisher,
              total, available, created_at AS createdAt
       FROM books ORDER BY id`
    )
    res.json({ code: 200, data: rows })
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message })
  }
})

// 新增图书（POST /api/books）
router.post('/', async (req, res) => {
  const { title, author, isbn, category, publisher, total, available } = req.body
  if (!title || !author) {
    return res.status(400).json({ code: 400, msg: '书名和作者必填' })
  }
  const t = Number(total)
  const a = available === undefined ? t : Number(available)
  if (!Number.isInteger(t) || t < 0 || !Number.isInteger(a) || a < 0 || a > t) {
    return res.status(400).json({ code: 400, msg: '库存参数不合法' })
  }
  try {
    const [r] = await pool.query(
      'INSERT INTO books (title, author, isbn, category, publisher, total, available) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, author, isbn || null, category || null, publisher || null, t, a]
    )
    res.json({ code: 200, data: { id: r.insertId } })
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message })
  }
})

// 更新图书（PUT /api/books/update，id 放 body）
router.put('/update', async (req, res) => {
  const { id, title, author, isbn, category, publisher, total, available } = req.body
  if (!id || !title || !author) {
    return res.status(400).json({ code: 400, msg: '参数错误' })
  }
  const t = Number(total)
  const a = Number(available)
  if (!Number.isInteger(t) || t < 0 || !Number.isInteger(a) || a < 0 || a > t) {
    return res.status(400).json({ code: 400, msg: '库存参数不合法' })
  }
  try {
    const [r] = await pool.query(
      'UPDATE books SET title=?, author=?, isbn=?, category=?, publisher=?, total=?, available=? WHERE id=?',
      [title, author, isbn || null, category || null, publisher || null, t, a, id]
    )
    if (r.affectedRows === 0) return res.status(404).json({ code: 404, msg: '图书不存在' })
    res.json({ code: 200, msg: '更新成功' })
  } catch (e) {
    res.status(500).json({ code: 500, msg: e.message })
  }
})

// 删除（下架）图书（DELETE /api/books/delete/:id）
router.delete('/delete/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!id) return res.status(400).json({ code: 400, msg: '参数错误' })
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [b] = await conn.query(
      'SELECT COUNT(*) AS c FROM borrows WHERE book_id=? AND return_time IS NULL',
      [id]
    )
    if (b[0].c > 0) {
      await conn.rollback()
      return res.status(409).json({ code: 409, msg: '该书存在未归还的借阅，无法下架' })
    }
    const [r] = await conn.query('DELETE FROM books WHERE id=?', [id])
    if (r.affectedRows === 0) {
      await conn.rollback()
      return res.status(404).json({ code: 404, msg: '图书不存在' })
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
