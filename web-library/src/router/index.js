import { createRouter, createWebHashHistory } from 'vue-router'

// 采用 hash 模式，本地/构建后都无需服务端配置即可直开
const routes = [
  { path: '/', redirect: '/students' },
  {
    path: '/students',
    name: 'students',
    component: () => import('../views/Students.vue'),
    meta: { title: '学生管理' },
  },
  {
    path: '/books',
    name: 'books',
    component: () => import('../views/Books.vue'),
    meta: { title: '图书管理' },
  },
  {
    path: '/borrows',
    name: 'borrows',
    component: () => import('../views/Borrows.vue'),
    meta: { title: '借阅管理' },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.afterEach((to) => {
  if (to.meta.title) document.title = `${to.meta.title} · 图书馆管理`
})

export default router
