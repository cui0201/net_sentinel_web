<template>
  <div class="rule-container">
    <el-card class="rule-card">
      <template #header>
        <div class="card-header">
          <span>事件日志查询</span>
        </div>
      </template>

      <div class="search-area">
        <el-input
          v-model="searchQuery"
          placeholder="搜索日志内容"
          style="width: 300px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="margin-left: 16px; width: 350px"
        />
        
        <el-select
          v-model="logLevel"
          placeholder="日志级别"
          clearable
          style="margin-left: 16px; width: 120px"
        >
          <el-option label="ERROR" value="ERROR" />
          <el-option label="WARN" value="WARN" />
          <el-option label="INFO" value="INFO" />
        </el-select>
      </div>

      <el-table :data="filteredLogs" style="width: 100%" border>
        <el-table-column prop="timestamp" label="时间" width="180" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.level)">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源" width="120" />
        <el-table-column prop="message" label="事件内容" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" @click="showDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalLogs"
          layout="prev, pager, next, sizes"
          :page-sizes="[10, 20, 50, 100]"
          :background="true"
        />
      </div>

      <!-- 日志详情弹窗 -->
      <el-dialog v-model="detailVisible" title="日志详情" width="60%">
        <el-descriptions :column="1" border v-if="currentLog">
          <el-descriptions-item label="时间">{{ currentLog.timestamp }}</el-descriptions-item>
          <el-descriptions-item label="级别">
            <el-tag :type="getLevelTagType(currentLog.level)">
              {{ currentLog.level }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="来源">{{ currentLog.source }}</el-descriptions-item>
          <el-descriptions-item label="事件内容">{{ currentLog.message }}</el-descriptions-item>
          <el-descriptions-item label="原始日志">
            <pre>{{ currentLog.raw }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="解析字段" v-if="currentLog.fields">
            <el-table :data="currentLog.fields" border>
              <el-table-column prop="name" label="字段名" width="150" />
              <el-table-column prop="value" label="值" />
            </el-table>
          </el-descriptions-item>
        </el-descriptions>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

// 示例日志数据
const logsList = ref([
  {
    id: 1,
    timestamp: '2023-05-15 14:30:22',
    level: 'ERROR',
    source: 'server-01',
    message: 'CPU usage 95%',
    raw: '2023-05-15 14:30:22 [ERROR] CPU usage 95% on server-01',
    fields: [
      { name: 'metric', value: 'CPU' },
      { name: 'value', value: '95%' }
    ]
  },
  {
    id: 2,
    timestamp: '2023-05-15 13:45:10',
    level: 'WARN',
    source: 'server-02',
    message: 'Memory usage 8%',
    raw: '2023-05-15 13:45:10 [WARN] Memory usage 8% on server-02',
    fields: [
      { name: 'metric', value: 'Memory' },
      { name: 'value', value: '8%' }
    ]
  }
])

const searchQuery = ref('')
const dateRange = ref([])
const logLevel = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const currentLog = ref(null)

const filteredLogs = computed(() => {
  let result = logsList.value
  
  // 按搜索词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(log => 
      log.message.toLowerCase().includes(query) ||
      log.source.toLowerCase().includes(query)
    )
  }
  
  // 按日志级别过滤
  if (logLevel.value) {
    result = result.filter(log => log.level === logLevel.value)
  }
  
  // 按日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    result = result.filter(log => {
      const logDate = new Date(log.timestamp)
      return logDate >= start && logDate <= end
    })
  }
  
  return result.slice(
    (currentPage.value - 1) * pageSize.value,
    currentPage.value * pageSize.value
  )
})

const totalLogs = computed(() => logsList.value.length)

const getLevelTagType = (level) => {
  const map = { ERROR: 'danger', WARN: 'warning', INFO: 'info' }
  return map[level] || ''
}

const showDetail = (log) => {
  currentLog.value = log
  detailVisible.value = true
}
</script>

<style scoped>
.search-area {
  display: flex;
  margin-bottom: 16px;
  align-items: center;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  padding: 12px 0;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

pre {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>