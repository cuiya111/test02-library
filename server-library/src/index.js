require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') })
const app = require('./app')

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 图书馆后端已启动：http://localhost:${PORT}`)
})
