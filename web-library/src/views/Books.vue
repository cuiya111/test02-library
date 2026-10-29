<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLibrary } from '../api/library'

const { books, addBook, updateBook, removeBook } = useLibrary()

const keyword = ref('')
const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return books.value
  return books.value.filter(
    (b) =>
      b.title.toLowerCase().includes(kw) ||
      b.author.toLowerCase().includes(kw) ||
      b.isbn.toLowerCase().includes(kw)
  )
})

const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref()
const form = reactive({
  title: '',
  author: '',
  isbn: '',
  category: '',
  publisher: '',
  total: 1,
  available: 1,
})

const rules = {
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  total: [
    { required: true, message: '请输入总库存', trigger: 'blur' },
    {
      validator: (_r, v, cb) => {
        if (v < 0) cb(new Error('库存不能为负'))
        else if (v < form.available) cb(new Error('总库存不能小于可借数'))
        else cb()
      },
      trigger: 'blur',
    },
  ],
  available: [
    { required: true, message: '请输入可借数量', trigger: 'blur' },
    {
      validator: (_r, v, cb) => {
        if (v < 0) cb(new Error('可借数不能为负'))
        else if (v > form.total) cb(new Error('可借数不能大于总库存'))
        else cb()
      },
      trigger: 'blur',
    },
  ],
}

function openCreate() {
  editingId.value = null
  Object.assign(form, {
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    total: 1,
    available: 1,
  })
  dialogVisible.value = true
}

function openEdit(row) {
  editingId.value = row.id
  Object.assign(form, {
    title: row.title,
    author: row.author,
    isbn: row.isbn,
    category: row.category,
    publisher: row.publisher,
    total: row.total,
    available: row.available,
  })
  dialogVisible.value = true
}

async function submit() {
  await formRef.value.validate()
  try {
    if (editingId.value === null) {
      await addBook({ ...form }); ElMessage.success('图书已入库')
    } else {
      await updateBook(editingId.value, { ...form }); ElMessage.success('图书信息已更新')
    }
    dialogVisible.value = false
  } catch (e) { ElMessage.error(e.message) }
}

async function remove(row) {
  ElMessageBox.confirm(`确定下架图书「${row.title}」吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '下架',
    cancelButtonText: '取消',
  })
    .then(async () => {
      try {
        await removeBook(row.id)
        ElMessage.success('已下架')
      } catch (e) {
        ElMessage.error(e.message)
      }
    })
    .catch(() => {})
}
</script>

<template>
  <div class="page-wrap">
  <div class="lib-card">
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="按书名、作者或 ISBN 搜索"
        clearable
        style="width: 260px"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <div class="spacer" />
      <span class="mini-stat">馆藏 <b>{{ filtered.length }}</b> 种</span>
      <el-button type="primary" @click="openCreate">
        <el-icon style="margin-right: 4px"><Plus /></el-icon>新增图书
      </el-button>
    </div>

    <el-table :data="filtered" style="width: 100%" empty-text="暂无图书数据">
      <el-table-column prop="title" label="书名" min-width="180">
        <template #default="{ row }">
          <span class="book-title">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="author" label="作者" width="150" />
      <el-table-column prop="isbn" label="ISBN" width="150" />
      <el-table-column prop="category" label="分类" width="90" />
      <el-table-column prop="publisher" label="出版社" min-width="150" />
      <el-table-column label="库存（可借/总）" width="130">
        <template #default="{ row }">
          <el-tag
            :type="row.available === 0 ? 'danger' : row.available <= Math.ceil(row.total / 3) ? 'warning' : 'success'"
            effect="plain"
          >
            {{ row.available }} / {{ row.total }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="remove(row)">下架</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog
    v-model="dialogVisible"
    :title="editingId === null ? '新增图书' : '编辑图书'"
    width="480px"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="书名" prop="title">
        <el-input v-model="form.title" placeholder="书名" />
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input v-model="form.author" placeholder="作者" />
      </el-form-item>
      <el-form-item label="ISBN">
        <el-input v-model="form.isbn" placeholder="如 9787111544937" />
      </el-form-item>
      <el-form-item label="分类">
        <el-input v-model="form.category" placeholder="如 计算机 / 文学" />
      </el-form-item>
      <el-form-item label="出版社">
        <el-input v-model="form.publisher" placeholder="出版社" />
      </el-form-item>
      <el-form-item label="总库存" prop="total">
        <el-input-number v-model="form.total" :min="1" :max="999" />
      </el-form-item>
      <el-form-item label="可借数量" prop="available">
        <el-input-number v-model="form.available" :min="0" :max="999" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submit">保存</el-button>
    </template>
  </el-dialog>
  </div>
</template>
