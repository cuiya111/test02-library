const mysql = require('mysql2/promise')
require('dotenv').config()

// MySQL 5.7 连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'web_library',
  waitForConnections: true,
  connectionLimit: 10, // 最多 10 个并发连接
  queueLimit: 0,
  charset: 'utf8mb4',
})

// 测试连接
;(async () => {
  try {
    const conn = await pool.getConnection()
    console.log('✅ MySQL 连接成功')
    conn.release()
  } catch (err) {
    console.error('❌ MySQL连接失败：', err.message)
  }
})()

module.exports = pool
