<template>
  <div class="rule-container">
    <el-card class="log-card">
      <template #header>
        <div class="card-header">
          <span>日志查询</span>
        </div>
      </template>
      
      <!-- 查询条件部分 -->
      <el-form :model="searchForm" label-width="100px" class="search-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="日志内容">
              <el-input v-model="searchForm.logContent" placeholder="请输入日志内容关键字"></el-input>
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
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item>
          <el-button type="primary" @click="searchLogs">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-divider content-position="center">查询结果</el-divider>
      
      <!-- 查询结果部分 -->
      <div class="result-section">
        <el-table :data="logData" style="width: 100%" border v-loading="loading">
          <el-table-column prop="timestamp" label="时间" width="280" align="center"></el-table-column>
          <el-table-column prop="logLevel" label="级别" width="180" align="center">
            <template #default="{ row }">
              <el-tag :type="getLogLevelType(row.logLevel)">{{ row.logLevel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="deviceName" label="设备名称" width="153" align="center"></el-table-column>
          <el-table-column prop="eventType" label="事件类型" width="250" align="center"></el-table-column>
          <el-table-column label="操作" width="200" fixed="right" align="center"> 
            <template #default="{ row }">
              <el-button type="primary" size="big" @click="showLogDetail(row)">
                <el-icon><View /></el-icon>
                  详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="searchForm.currentPage"
            v-model:page-size="searchForm.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </div>
    </el-card>
    
    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="日志详情"
      width="70%"
      destroy-on-close
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ currentLog.id }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ currentLog.timestamp }}</el-descriptions-item>
        <el-descriptions-item label="级别">
          <el-tag :type="getLogLevelType(currentLog.logLevel)">{{ currentLog.logLevel }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="设备类型">{{ currentLog.deviceType }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ currentLog.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="源IP">{{ currentLog.sourceIp }}</el-descriptions-item>
        <el-descriptions-item label="目标IP">{{ currentLog.destinationIp }}</el-descriptions-item>
        <el-descriptions-item label="源端口">{{ currentLog.sourcePort }}</el-descriptions-item>
        <el-descriptions-item label="目标端口">{{ currentLog.destinationPort }}</el-descriptions-item>
        <el-descriptions-item label="协议">{{ currentLog.protocol }}</el-descriptions-item>
        <el-descriptions-item label="事件类型">{{ currentLog.eventType }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentLog.description }}</el-descriptions-item>
        <el-descriptions-item label="原始日志" :span="2">
          <el-input
            type="textarea"
            :rows="3"
            v-model="currentLog.logText"
            readonly
          ></el-input>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { View } from '@element-plus/icons-vue'  // 导入 View 图标

const router = useRouter()
// 搜索表单数据
const searchForm = reactive({
  logContent: '',
  beginTime: '',
  endTime: '',
  logLevel: '',
  currentPage: 1,
  pageNum: 1,
  pageSize: 10,
  orderBy: '',
  order: ''
})

// 日期范围选择器
const dateRange = ref([])

// 监听日期范围变化，更新搜索表单中的开始和结束时间
watch(dateRange, (newVal) => {
  if (newVal && newVal.length === 2) {
    searchForm.beginTime = newVal[0]
    searchForm.endTime = newVal[1]
  } else {
    searchForm.beginTime = ''
    searchForm.endTime = ''
  }
})

// 日志数据
const logData = ref([])
const total = ref(0)
const loading = ref(false)

// 日志详情对话框
const dialogVisible = ref(false)
const currentLog = ref({})

// 显示日志详情
const showLogDetail = (row) => {
  currentLog.value = row
  dialogVisible.value = true
}

// 获取日志级别对应的标签类型
const getLogLevelType = (level) => {
  const types = {
    'INFO': 'info',
    'WARNING': 'warning',
    'ERROR': 'danger'
  }
  return types[level] || 'info'
}

// 查询日志
const searchLogs = async () => {
  loading.value = true
  try {
    // 确保页码同步
    searchForm.pageNum = searchForm.currentPage
    
    // 从用户存储中获取 token
    const userStore = useUserStore()
    const token = userStore.token
    
    if (!token) {
      ElMessage.error('未登录或登录已过期，请重新登录')
      router.push('/login')
      return
    }
    
    const response = await axios.post('/api/log/logSearch', searchForm, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.data.code === 200) {
      logData.value = response.data.data.records
      total.value = response.data.data.total
      
      if (logData.value.length === 0) {
        ElMessage.info('未查询到符合条件的日志')
      }
    } else {
      ElMessage.error(response.data.message || '查询失败')
    }
  } catch (error) {
    console.error('查询日志出错:', error)
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
    } else {
      ElMessage.error('查询日志出错，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  searchForm.logContent = ''
  searchForm.logLevel = ''
  dateRange.value = []
  searchForm.beginTime = ''
  searchForm.endTime = ''
  searchForm.currentPage = 1
  searchForm.pageNum = 1
  searchForm.pageSize = 10
  searchForm.orderBy = ''
  searchForm.order = ''
}

// 处理每页显示数量变化
const handleSizeChange = (size) => {
  searchForm.pageSize = size
  searchLogs()
}

// 处理页码变化
const handleCurrentChange = (page) => {
  searchForm.currentPage = page
  searchForm.pageNum = page
  searchLogs()
}

// 初始加载
searchLogs()
</script>

<style scoped>
.rule-container {
  padding: 20px;
}

.log-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 10px;
}

.result-section {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.el-descriptions {
  width: 100%;
}
</style>