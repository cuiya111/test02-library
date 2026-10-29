<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLibrary } from '../api/library'

const { students, addStudent, updateStudent, removeStudent } = useLibrary()

// 搜索
const keyword = ref('')
const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return students.value
  return students.value.filter(
    (s) =>
      s.name.toLowerCase().includes(kw) || s.studentNo.toLowerCase().includes(kw)
  )
})

// 新增 / 编辑弹窗
const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref()
const form = reactive({ name: '', studentNo: '', major: '', className: '', phone: '' })

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  studentNo: [{ required: true, message: '请输入学号', trigger: 'blur' }],
}

function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', studentNo: '', major: '', className: '', phone: '' })
  dialogVisible.value = true
}

function openEdit(row) {
  editingId.value = row.id
  Object.assign(form, {
    name: row.name,
    studentNo: row.studentNo,
    major: row.major,
    className: row.className,
    phone: row.phone,
  })
  dialogVisible.value = true
}

async function submit() {
  await formRef.value.validate()
  try {
    if (editingId.value === null) {
      await addStudent({ ...form }); ElMessage.success('学生已添加')
    } else {
      await updateStudent(editingId.value, { ...form }); ElMessage.success('学生信息已更新')
    }
    dialogVisible.value = false
  } catch (e) { ElMessage.error(e.message) }
}

async function remove(row) {
  ElMessageBox.confirm(`确定删除学生「${row.name}」吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
    .then(async () => {
      try {
        await removeStudent(row.id);
        ElMessage.success('学生已删除')
      } catch (e) { ElMessage.error(e.message) }
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
        placeholder="按姓名或学号搜索"
        clearable
        style="width: 240px"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <div class="spacer" />
      <span class="mini-stat">共 <b>{{ filtered.length }}</b> 名学生</span>
      <el-button type="primary" @click="openCreate">
        <el-icon style="margin-right: 4px"><Plus /></el-icon>新增学生
      </el-button>
    </div>

    <el-table :data="filtered" style="width: 100%" empty-text="暂无学生数据">
      <el-table-column prop="studentNo" label="学号" width="120" />
      <el-table-column prop="name" label="姓名" width="140">
        <template #default="{ row }">
          <span class="book-title">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="major" label="专业" min-width="140" />
      <el-table-column prop="className" label="班级" width="130" />
      <el-table-column prop="phone" label="联系电话" width="140" />
      <el-table-column label="操作" width="150" align="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog
    v-model="dialogVisible"
    :title="editingId === null ? '新增学生' : '编辑学生'"
    width="460px"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="学生姓名" />
      </el-form-item>
      <el-form-item label="学号" prop="studentNo">
        <el-input v-model="form.studentNo" placeholder="如 2024001" />
      </el-form-item>
      <el-form-item label="专业">
        <el-input v-model="form.major" placeholder="所学专业" />
      </el-form-item>
      <el-form-item label="班级">
        <el-input v-model="form.className" placeholder="如 计科2301" />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="form.phone" placeholder="手机号" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submit">保存</el-button>
    </template>
  </el-dialog>
  </div>
</template>
