<template>
  <div class="alert-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>告警规则管理</span>
          <div>
            <el-button type="primary" @click="showAddDialog">添加规则</el-button>
          </div>
        </div>
      </template>

      <!-- 查询条件 -->
      <el-form :model="searchForm" label-width="100px" class="search-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="规则名称">
              <el-input v-model="searchForm.ruleName" placeholder="请输入规则名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="日志级别">
              <el-select v-model="searchForm.logLevel" placeholder="请选择日志级别" clearable style="width: 100%">
                <el-option label="INFO" value="INFO"></el-option>
                <el-option label="WARNING" value="WARNING"></el-option>
                <el-option label="ERROR" value="ERROR"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="告警等级">
              <el-select v-model="searchForm.alertGrade" placeholder="请选择告警等级" clearable style="width: 100%">
                <el-option label="高级告警" value="高级告警"></el-option>
                <el-option label="中级告警" value="中级告警"></el-option>
                <el-option label="低级告警" value="低级告警"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="searchRules">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 规则列表 -->
      <el-table :data="ruleData" style="width: 100%" border v-loading="loading">
        <el-table-column prop="ruleName" label="规则名称" width="200" align="center"></el-table-column>
        <el-table-column prop="logLevel" label="日志级别" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getLogLevelType(row.logLevel)">{{ row.logLevel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="eventType" label="事件类型" width="253" align="center"></el-table-column>
        <el-table-column prop="alertGrade" label="告警等级" width="150" align="center"></el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已启用' : '未启用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="editRule(row)">编辑</el-button>
            <el-button type="primary" link @click="toggleStatus(row)">
              {{ row.status === 1 ? '停用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="deleteRule(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="searchForm.currentPage"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        >
          <template #total>
            总条数 {{ total }}
          </template>
        </el-pagination>
      </div>
    </el-card>

    <!-- 添加/编辑规则弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑规则' : '添加规则'" width="50%">
      <el-form :model="ruleForm" :rules="rules" ref="ruleFormRef" label-width="100px">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="ruleForm.ruleName" placeholder="请输入规则名称"></el-input>
        </el-form-item>
        <el-form-item label="日志级别" prop="logLevel">
          <el-select v-model="ruleForm.logLevel" placeholder="请选择日志级别" style="width: 100%">
            <el-option label="INFO" value="INFO"></el-option>
            <el-option label="WARNING" value="WARNING"></el-option>
            <el-option label="ERROR" value="ERROR"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="事件类型" prop="eventType">
          <el-select v-model="ruleForm.eventType" placeholder="请选择事件类型" style="width: 100%">
            <el-option
              v-for="type in eventTypeList"
              :key="type"
              :label="type"
              :value="type"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="告警等级" prop="alertGrade">
          <el-select v-model="ruleForm.alertGrade" placeholder="请选择告警等级" style="width: 100%">
            <el-option label="高级告警" value="高级告警"></el-option>
            <el-option label="中级告警" value="中级告警"></el-option>
            <el-option label="低级告警" value="低级告警"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="ruleForm.status" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { useUserStore } from '../store/user'  // 引入用户 store
import { useRouter } from 'vue-router'  // 引入路由

const router = useRouter()
const userStore = useUserStore()  // 创建 store 实例

// 搜索表单数据
const searchForm = reactive({
  ruleName: '',
  logLevel: '',
  alertGrade: '',
  currentPage: 1,
  pageNum: 1,
  pageSize: 10,
  orderBy: '',
  order: ''
})

// 表格数据
const ruleData = ref([])
const total = ref(0)
const loading = ref(false)

// 表单数据
const dialogVisible = ref(false)
const isEdit = ref(false)
const ruleFormRef = ref(null)
const ruleForm = reactive({
  id: '',
  ruleName: '',
  logLevel: '',
  eventType: '',
  alertGrade: '',
  status: 1
})

// 表单验证规则
const rules = {
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  logLevel: [{ required: true, message: '请选择日志级别', trigger: 'change' }],
  eventType: [{ required: true, message: '请输入事件类型', trigger: 'blur' }],
  alertGrade: [{ required: true, message: '请选择告警等级', trigger: 'change' }]
}

// 获取日志级别对应的标签类型
const getLogLevelType = (level) => {
  const types = {
    'INFO': 'info',
    'WARNING': 'warning',
    'ERROR': 'danger'
  }
  return types[level] || ''
}

// 查询规则列表
const searchRules = async () => {
  loading.value = true
  try {
    // 获取 token
    const token = userStore.token
    if (!token) {
      ElMessage.error('未登录或登录已过期，请重新登录')
      router.push('/login')
      return
    }

    searchForm.pageNum = searchForm.currentPage
    const response = await axios.post('/api/alertRule/queryPageForAlertRule', searchForm, {
      headers: {
        'Authorization': `Bearer ${token}`  // 添加 token 到请求头
      }
    })
    
    if (response.data.code === 200) {
      ruleData.value = response.data.data.records
      total.value = response.data.data.total
    } else {
      ElMessage.error(response.data.message || '查询失败')
    }
  } catch (error) {
    console.error('查询失败:', error)
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
    } else {
      ElMessage.error('查询失败')
    }
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  searchForm.ruleName = ''
  searchForm.logLevel = ''
  searchForm.alertGrade = ''
  searchForm.currentPage = 1
  searchForm.pageNum = 1
  searchRules()
}

// 事件类型列表
const eventTypeList = ref([])

// 获取事件类型列表
const getEventTypes = async () => {
  try {
    const token = userStore.token
    if (!token) {
      ElMessage.error('未登录或登录已过期，请重新登录')
      router.push('/login')
      return
    }

    const response = await axios.get('/api/alertRule/queryAllLogEvent', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.data.code === 200) {
      eventTypeList.value = response.data.data
    } else {
      ElMessage.error(response.data.message || '获取事件类型列表失败')
    }
  } catch (error) {
    console.error('获取事件类型列表失败:', error)
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
    } else {
      ElMessage.error('获取事件类型列表失败')
    }
  }
}

// 在组件挂载时获取事件类型列表
onMounted(() => {
  getEventTypes()
})

// 显示添加对话框
const showAddDialog = () => {
  isEdit.value = false
  Object.assign(ruleForm, {
    id: '',
    ruleName: '',
    logLevel: '',
    eventType: '',
    alertGrade: '',
    status: 1
  })
  // 确保事件类型列表已加载
  if (eventTypeList.value.length === 0) {
    getEventTypes()
  }
  dialogVisible.value = true
}

// 显示编辑对话框
const editRule = (row) => {
  isEdit.value = true
  Object.assign(ruleForm, row)
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!ruleFormRef.value) return
  await ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const token = userStore.token
        if (!token) {
          ElMessage.error('未登录或登录已过期，请重新登录')
          router.push('/login')
          return
        }

        const response = await axios.post('/api/alertRule/buildAlertRule', ruleForm, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.data.code === 200) {
          ElMessage.success(`${isEdit.value ? '修改' : '添加'}成功`)
          dialogVisible.value = false
          searchRules()
        } else {
          ElMessage.error(response.data.message || `${isEdit.value ? '修改' : '添加'}失败`)
        }
      } catch (error) {
        console.error(`${isEdit.value ? '修改' : '添加'}失败:`, error)
        ElMessage.error(`${isEdit.value ? '修改' : '添加'}失败`)
      }
    }
  })
}

// 切换规则状态
const toggleStatus = async (row) => {
  try {
    const token = userStore.token
    if (!token) {
      ElMessage.error('未登录或登录已过期，请重新登录')
      router.push('/login')
      return
    }

    const newStatus = row.status === 1 ? 0 : 1
    const updateData = {
      ...row,
      status: newStatus
    }

    const response = await axios.post('/api/alertRule/buildAlertRule', updateData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.data.code === 200) {
      ElMessage.success(`${newStatus === 1 ? '启用' : '停用'}成功`)
      searchRules()
    } else {
      ElMessage.error(response.data.message || '操作失败')
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// 删除规则
const deleteRule = (row) => {
  ElMessageBox.confirm('确认删除该规则吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // TODO: 调用后端接口删除规则
      ElMessage.success('删除成功')
      searchRules()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  searchForm.pageSize = val
  searchRules()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  searchForm.currentPage = val
  searchForm.pageNum = val
  searchRules()
}

// 初始化加载
searchRules()
</script>

<style scoped>
.alert-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  padding-top: 20px;
  text-align: right;
}
</style>