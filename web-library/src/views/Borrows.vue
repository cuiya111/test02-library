<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLibrary } from '../api/library'

const { state, borrows, borrowBook, returnBook } = useLibrary()

const students = computed(() => state.students)
const books = computed(() => state.books)
// 仅可借的图书才能被选
const borrowableBooks = computed(() => state.books.filter((b) => b.available > 0))

// 筛选
const statusFilter = ref('all')
const keyword = ref('')
const filtered = computed(() => {
  let list = borrows.value
  if (statusFilter.value === 'active') list = list.filter((b) => !b.returnTime)
  if (statusFilter.value === 'returned') list = list.filter((b) => b.returnTime)
  const kw = keyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(
      (b) => b.studentName.toLowerCase().includes(kw) || b.bookTitle.toLowerCase().includes(kw)
    )
  }
  return list
})

const activeCount = computed(() => borrows.value.filter((b) => !b.returnTime).length)
const overdueCount = computed(() => borrows.value.filter((b) => b.isOverdue).length)

// 借书对话框
const borrowVisible = ref(false)
const borrowForm = ref({ studentId: null, bookId: null, dueDays: 30 })

function openBorrow() {
  if (borrowableBooks.value.length === 0) {
    ElMessage.warning('当前没有可借出的图书库存')
    return
  }
  borrowForm.value = { studentId: null, bookId: null, dueDays: 30 }
  borrowVisible.value = true
}

async function submitBorrow() {
  if (!borrowForm.value.studentId || !borrowForm.value.bookId)
    return ElMessage.warning('请选择借阅学生和图书')
  try {
    await borrowBook(borrowForm.value.studentId, borrowForm.value.bookId, borrowForm.value.dueDays)
    ElMessage.success('借阅登记成功')
    borrowVisible.value = false
  } catch (e) { ElMessage.error(e.message) }
}

async function doReturn(row) {
  ElMessageBox.confirm(
    `确认归还「${row.bookTitle}」（${row.studentName}）？`,
    '归还确认',
    { type: 'info', confirmButtonText: '确认归还', cancelButtonText: '取消' }
  )
    .then(async () => {
      try {
        await returnBook(row.id)
        ElMessage.success('已归还，库存已恢复')
      } catch (e) {
        ElMessage.error(e.message)
      }
    })
    .catch(() => {})
}

function fmt(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
</script>

<template>
  <div class="page-wrap">
  <div class="stat-row">
    <div class="stat-cell">
      <div class="stat-num">{{ activeCount }}</div>
      <div class="stat-label">借出中</div>
    </div>
    <div class="stat-cell">
      <div class="stat-num is-warn">{{ overdueCount }}</div>
      <div class="stat-label">已逾期</div>
    </div>
    <div class="stat-cell">
      <div class="stat-num">{{ state.books.reduce((s, b) => s + b.available, 0) }}</div>
      <div class="stat-label">可借图书</div>
    </div>
  </div>

  <div class="lib-card">
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="按学生姓名或书名搜索"
        clearable
        style="width: 240px"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-radio-group v-model="statusFilter">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="active">借出中</el-radio-button>
        <el-radio-button value="returned">已归还</el-radio-button>
      </el-radio-group>
      <div class="spacer" />
      <span class="mini-stat">共 <b>{{ filtered.length }}</b> 条记录</span>
      <el-button type="primary" @click="openBorrow">
        <el-icon style="margin-right: 4px"><Plus /></el-icon>办理借书
      </el-button>
    </div>

    <el-table :data="filtered" style="width: 100%" empty-text="暂无借阅记录">
      <el-table-column prop="studentNo" label="学号" width="110" />
      <el-table-column prop="studentName" label="借阅学生" width="120">
        <template #default="{ row }">
          <span class="book-title">{{ row.studentName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="bookTitle" label="图书" min-width="170" />
      <el-table-column label="借出日期" width="120">
        <template #default="{ row }">{{ fmt(row.borrowTime) }}</template>
      </el-table-column>
      <el-table-column label="应还日期" width="120">
        <template #default="{ row }">{{ fmt(row.dueTime) }}</template>
      </el-table-column>
      <el-table-column label="归还日期" width="120">
        <template #default="{ row }">{{ fmt(row.returnTime) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.returnTime" type="success" effect="light">已归还</el-tag>
          <el-tag v-else-if="row.isOverdue" type="danger" effect="light">已逾期</el-tag>
          <el-tag v-else type="warning" effect="light">借出中</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="right">
        <template #default="{ row }">
          <el-button v-if="!row.returnTime" link type="primary" @click="doReturn(row)">
            归还
          </el-button>
          <span v-else class="done-mark">已完结</span>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog v-model="borrowVisible" title="办理借书" width="440px" destroy-on-close>
    <el-form label-width="90px">
      <el-form-item label="借阅学生">
        <el-select v-model="borrowForm.studentId" placeholder="选择学生" filterable style="width: 100%">
          <el-option
            v-for="s in students"
            :key="s.id"
            :label="`${s.name}（${s.studentNo}）`"
            :value="s.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="借阅图书">
        <el-select v-model="borrowForm.bookId" placeholder="选择图书（仅显示有库存）" filterable style="width: 100%">
          <el-option
            v-for="b in borrowableBooks"
            :key="b.id"
            :label="`${b.title}（可借 ${b.available}）`"
            :value="b.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="借阅天数">
        <el-input-number v-model="borrowForm.dueDays" :min="1" :max="365" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="borrowVisible = false">取消</el-button>
      <el-button type="primary" @click="submitBorrow">确认借出</el-button>
    </template>
  </el-dialog>
  </div>
</template>

<style scoped>
.stat-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}
.stat-cell {
  background: var(--lib-panel);
  border: 1px solid var(--lib-line);
  border-radius: 12px;
  padding: 16px 20px;
}
.stat-num {
  font-size: 26px;
  font-weight: 700;
  color: var(--el-color-primary);
  line-height: 1;
}
.stat-num.is-warn {
  color: var(--lib-accent);
}
.stat-label {
  margin-top: 8px;
  font-size: 13px;
  color: #8b8377;
}
.done-mark {
  color: #a89f90;
  font-size: 13px;
}
@media (max-width: 720px) {
  .stat-row {
    grid-template-columns: 1fr;
  }
}
</style>
