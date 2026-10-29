import http from './http'

// 学生
export const studentApi = {
  list: () => http.get('/students'),
  create: (data) => http.post('/students', data),
  update: (id, patch) => http.put('/students/update', { id, ...patch }),
  remove: (id) => http.delete(`/students/delete/${id}`),
}

// 图书
export const bookApi = {
  list: () => http.get('/books'),
  create: (data) => http.post('/books', data),
  update: (id, patch) => http.put('/books/update', { id, ...patch }),
  remove: (id) => http.delete(`/books/delete/${id}`),
}

// 借阅
export const borrowApi = {
  list: () => http.get('/borrows'),
  borrow: (studentId, bookId, dueDays = 30) => http.post('/borrows', { studentId, bookId, dueDays }),
  return: (borrowId) => http.post('/borrows/return', { borrowId }),
}

// 对接接口文档，后续加接口只需在app.js中引入即可
