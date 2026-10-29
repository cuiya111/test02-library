import { reactive, computed } from 'vue'
import { studentApi, bookApi, borrowApi } from './api'

const state = reactive({ students: [], books: [], borrows: [] })

// 操作成功后刷新对应实体
async function refresh(target) {
  if (target === 'students') state.students = await studentApi.list()
  if (target === 'books') state.books = await bookApi.list()
  if (target === 'borrows') state.borrows = await borrowApi.list()
}

// 首次加载（App.vue onMounted 调用）
export async function initLibrary() {
  const [students, books, borrows] = await Promise.all([
    studentApi.list(),
    bookApi.list(),
    borrowApi.list(),
  ])
  state.students = students
  state.books = books
  state.borrows = borrows
}

// 学生
async function addStudent(data) {
  const d = await studentApi.create(data)
  await refresh('students')
  return d
}
async function updateStudent(id, patch) {
  const d = await studentApi.update(id, patch)
  await refresh('students')
  return d
}
async function removeStudent(id) {
  const d = await studentApi.remove(id)
  await refresh('students')
  return d
}

// 图书
async function addBook(data) {
  const d = await bookApi.create(data)
  await refresh('books')
  return d
}
async function updateBook(id, patch) {
  const d = await bookApi.update(id, patch)
  await refresh('books')
  return d
}
async function removeBook(id) {
  const d = await bookApi.remove(id)
  await refresh('books')
  return d
}

// 借阅
async function borrowBook(studentId, bookId, dueDays = 30) {
  const d = await borrowApi.borrow(studentId, bookId, dueDays)
  await refresh('borrows')
  await refresh('books')
  return d
}
async function returnBook(borrowId) {
  const d = await borrowApi.return(borrowId)
  await refresh('borrows')
  await refresh('books')
  return d
}

export function useLibrary() {
  return {
    state,
    students: computed(() => state.students),
    books: computed(() => state.books),
    borrows: computed(() => state.borrows),
    initLibrary,
    addStudent, updateStudent, removeStudent,
    addBook, updateBook, removeBook,
    borrowBook, returnBook,
  }
}