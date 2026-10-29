# 图书馆管理系统（test02-library）

前后端分离的图书馆管理系统，涵盖学生管理、图书管理、借阅管理三大模块，支持借书/还书事务处理。

## 技术栈

| 端 | 技术 |
|---|---|
| 后端 | Node.js (Express 4) + MySQL 5.7 + mysql2 |
| 前端 | Vue 3 + Vite 8 + Element Plus + vue-router + axios |

## 目录结构

```
test02-library/
├── server-library/       # 后端：Node.js + Express + MySQL
├── web-library/          # 前端：Vue 3 + Vite + Element Plus
├── 接口文档.md            # 完整接口文档
└── README.md
```

## 快速开始

### 1. 初始化数据库

- 安装 MySQL 5.7
- 执行建表脚本（库名 `web_library`）：

```bash
mysql -u root -p < server-library/schema.sql
```

### 2. 启动后端

```bash
cd server-library
npm install
# 复制 .env.example 为 .env，并填写真实数据库密码
copy .env.example .env
npm start        # 生产方式
# 或
npm run dev      # 开发方式（nodemon 热更新）
```

启动后服务运行在 `http://localhost:3000`。

### 3. 启动前端

```bash
cd web-library
npm install
npm run dev
```

浏览器访问 Vite 提示的地址（默认 `http://localhost:5173`），开发环境下 `/api` 请求已代理到后端 `http://localhost:3000`。

## 功能模块

- **学生管理**：学生列表、新增、更新、删除（存在未归还借阅时禁止删除）
- **图书管理**：图书列表、新增、更新、下架（存在未归还借阅时禁止下架）
- **借阅管理**：借阅列表（含学生/书名/是否逾期）、借书（事务扣减库存）、还书（事务恢复库存）

## 生产部署

1. 前端构建：`cd web-library && npm run build`，产物输出到 `server-library/dist/web`
2. 后端打包：`cd server-library && npm run pkg`，生成 `dist/server.exe`
3. 运行 `dist/server.exe`，即可同时提供 API 与前端静态资源

## 注意事项

- 接口统一返回结构 `{ code, msg, data }`
- 完整接口说明见 [接口文档.md](./接口文档.md) 及 [server-library/README.md](./server-library/README.md)
- 后端数据库连接配置在 `server-library/.env`（勿提交真实密码）
