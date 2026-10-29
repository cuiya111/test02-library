const express = require('express')
const cors = require('cors')
require('dotenv').config()
const path = require('path')
const fs = require('fs')

const studentsRouter = require('./routes/students')
const booksRouter = require('./routes/books')
const borrowsRouter = require('./routes/borrows')

const app = express()

// 允许前端 dev server（localhost:31518）跨域访问
app.use(cors())
app.use(express.json())

// 路由挂载
app.use('/api/students', studentsRouter)
app.use('/api/books', booksRouter)
app.use('/api/borrows', borrowsRouter)

// 生产环境，静态资源托管 打包时删除'dist'
const webDir = path.resolve(process.cwd(), 'dist', 'web')
if (fs.existsSync(webDir)) {
  console.log('📄 静态文件目录：', webDir)
  app.use(express.static(webDir))
  // SPA 回退：非 /api 请求均返回 index.html（Express 5 写法，不带尾斜杠避免首段冲突）
  app.get(/^(?!\/api\$).*/, (req, res, next) => {
    res.sendFile(path.join(webDir, 'index.html'))
  })
} else {
  console.log('�️ 未找到 web 目录：' + webDir + '，跳过静态文件托管')
}

module.exports = app
