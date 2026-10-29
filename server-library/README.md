# server-library · 图书馆管理系统后端

基于 **Node.js + Express + MySQL 5.7** 的 REST API，供 `web-library` 前端调用。
数据库建表脚本见 `database/schema.sql`。

## 前置要求

- Node.js ≥ 18
- MySQL 5.7（请先执行 `database/schema.sql` 建库建表）

## 启动步骤

```bash
# 1. 安装依赖
npm install

# 2. 配置数据库连接
#    复制 .env.example 为 .env（已提供占位 .env），改成你真实的数据库密码

# 3. 启动（二选一）
npm start          # 生产方式
npm run dev        # 开发方式，nodemon 热更新
```

启动后服务运行在 `http://localhost:3000`。

## 接口清单

所有接口统一返回 `{ code, msg, data }`。**id 一律放请求体，不出现在 URL 路径中**。

### 学生
| 方法 | 路径 | body | 说明 |
|---|---|---|---|
| GET | `/api/students` | — | 学生列表 |
| POST | `/api/students` | name, studentNo, major?, className?, phone? | 新增学生（学号唯一） |
| PUT | `/api/students/update` | id, name, studentNo, major?, className?, phone? | 更新学生 |
| DELETE | `/api/students/delete/id` | — | 删除（有未还借阅则拒绝） |

### 图书
| 方法 | 路径 | body | 说明 |
|---|---|---|---|
| GET | `/api/books` | — | 图书列表 |
| POST | `/api/books` | title, author, isbn?, category?, publisher?, total, available? | 新增图书 |
| PUT | `/api/books/update` | id, title, author, isbn?, category?, publisher?, total, available | 更新图书 |
| DELETE | `/api/books/delete/id` | — | 下架（有未还借阅则拒绝） |

### 借阅
| 方法 | 路径 | body | 说明 |
|---|---|---|---|
| GET | `/api/borrows` | — | 借阅列表（含学生/书名/是否逾期） |
| POST | `/api/borrows` | studentId, bookId, dueDays? | 借书（事务扣库存） |
| POST | `/api/borrows/return` | borrowId | 还书（事务恢复库存） |

## 目录结构

```
server-library/
├── package.json
├── .env / .env.example      # 数据库连接配置
├── README.md
└── src/
    ├── app.js               # Express 入口，挂路由、CORS
    ├── db.js                # mysql2 连接池
    └── routes/
        ├── students.js      # 学生接口
        ├── books.js         # 图书接口
        └── borrows.js       # 借阅接口（含借书/还书事务）
```

## 事务说明

- **借书**：`UPDATE books 扣减可借 + INSERT borrows`，任一失败整体回滚，库存不足返回 409。
- **还书**：`UPDATE borrows 记归还时间 + UPDATE books 恢复库存`（恢复不超过总库存）。
- **删除**学生/图书：先校验是否存在未归还借阅，存在则拒绝（数据库外键 `RESTRICT` 兜底）。
