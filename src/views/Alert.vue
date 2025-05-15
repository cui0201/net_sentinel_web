<template>  <!-- 根模板标签开始 -->
  <div class="alert-container">  <!-- div容器开始 -->
    <el-card>  <!-- Element Plus卡片组件开始 -->
      <template #header>
        <div class="card-header">
          <span>告警规则管理</span>
          <div>
            <el-button type="primary" @click="showAddDialog">添加规则</el-button>
          </div>
        </div>
      </template>

      <el-table :data="paginatedRules" style="width: 100%" border>
        <el-table-column prop="name" label="规则名称" width="180" />
        <el-table-column prop="condition" label="触发条件" />
        <el-table-column prop="level" label="告警级别" width="120">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.level)">
              {{ getLevelLabel(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
              active-text="启用"
              inactive-text="禁用"
              @change="toggleRuleStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="editRule(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteRule(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalAlerts"
          layout="prev, pager, next, sizes"
          :page-sizes="[10, 20, 50, 100]"
          :background="true"
        />
      </div>

      <!-- 告警详情弹窗 -->
      <el-dialog v-model="detailVisible" title="告警详情" width="60%">
        <div v-if="currentAlert">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="告警名称">{{ currentAlert.name }}</el-descriptions-item>
            <el-descriptions-item label="告警级别">
              <el-tag :type="getLevelTagType(currentAlert.level)">
                {{ getLevelLabel(currentAlert.level) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="触发时间">{{ currentAlert.time }}</el-descriptions-item>
            <el-descriptions-item label="当前状态">
              <el-tag :type="getStatusTagType(currentAlert.status)">
                {{ getStatusLabel(currentAlert.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="触发条件" :span="2">{{ currentAlert.condition }}</el-descriptions-item>
            <el-descriptions-item label="相关日志" :span="2">
              <pre>{{ currentAlert.log }}</pre>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-dialog>
    </el-card>

    <!-- 添加/编辑规则弹窗 -->
    <el-dialog v-model="ruleDialogVisible" :title="isEditMode ? '编辑规则' : '添加规则'" width="50%">
      <el-form :model="currentRule" label-width="120px">
        <el-form-item label="规则名称" required>
          <el-input v-model="currentRule.name" />
        </el-form-item>
        <el-form-item label="触发条件" required>
          <el-input v-model="currentRule.condition" type="textarea" rows="3" />
        </el-form-item>
        <el-form-item label="告警级别" required>
          <el-select v-model="currentRule.level">
            <el-option label="严重告警" value="严重告警" />
            <el-option label="高级告警" value="高级告警" />
            <el-option label="中级告警" value="中级告警" />
            <el-option label="低级告警" value="低级告警" />
          </el-select>
        </el-form-item>
        <el-form-item label="启用规则">
          <el-switch v-model="currentRule.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, reactive, computed } from 'vue'

const rules = ref([
  {
    id: 1,
    name: 'CPU过高告警',
    condition: 'CPU > 90% 持续5分钟',
    level: '严重告警',
    enabled: true
  },
  {
    id: 2,
    name: '内存不足告警',
    condition: 'Memory < 10%',
    level: '高级告警',
    enabled: true
  }
])
const ruleDialogVisible = ref(false)
const isEditMode = ref(false)
const currentRule = reactive({
  id: null,
  name: '',
  condition: '',
  level: 'warning',
  enabled: true
})

const paginatedRules = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return rules.value.slice(start, end)
})

const showAddDialog = () => {
  isEditMode.value = false
  resetCurrentRule()
  ruleDialogVisible.value = true
}

const editRule = (rule) => {
  isEditMode.value = true
  Object.assign(currentRule, JSON.parse(JSON.stringify(rule)))
  ruleDialogVisible.value = true
}

const deleteRule = (rule) => {
  rules.value = rules.value.filter(r => r.id !== rule.id)
}

const toggleRuleStatus = (rule) => {
  // 可以在这里添加API调用或其他逻辑
  console.log(`规则 ${rule.id} 状态已更改为 ${rule.enabled ? '启用' : '禁用'}`)
}

const saveRule = () => {
  if (isEditMode.value) {
    const index = rules.value.findIndex(r => r.id === currentRule.id)
    if (index !== -1) {
      rules.value[index] = {...currentRule}
    }
  } else {
    const newId = Math.max(...rules.value.map(r => r.id)) + 1
    rules.value.push({...currentRule, id: newId})
  }
  ruleDialogVisible.value = false
}

const resetCurrentRule = () => {
  currentRule.id = null
  currentRule.name = ''
  currentRule.condition = ''
  currentRule.level = '高级告警'
  currentRule.enabled = true
}

const alerts = ref([
  {
    id: 1,
    name: 'CPU过高告警',
    level: 'critical',
    condition: 'CPU > 90% 持续5分钟',
    status: 'pending',
    time: '2023-05-15 14:30:22',
    log: '2023-05-15 14:30:22 [ERROR] CPU usage 95% on server-01',
    notifications: ['email']
  },
  {
    id: 2,
    name: '内存不足告警',
    level: 'warning',
    condition: 'Memory < 10%',
    status: 'confirmed',
    time: '2023-05-15 13:45:10',
    log: '2023-05-15 13:45:10 [WARN] Memory usage 8% on server-02',
    notifications: ['email']
  }
])

const filter = reactive({
  level: '',
  status: ''
})

const searchQuery = ref('')  // 新增搜索关键词
const currentAlert = ref(null)
const detailVisible = ref(false)

const filteredAlerts = computed(() => {
  return alerts.value.filter(alert => {
    const levelMatch = filter.level ? alert.level === filter.level : true
    const statusMatch = filter.status ? alert.status === filter.status : true
    const searchMatch = searchQuery.value ? 
      alert.name.includes(searchQuery.value) || 
      alert.condition.includes(searchQuery.value) : true
    return levelMatch && statusMatch && searchMatch
  })
})

const getLevelTagType = (level) => {
  const map = { 
    '严重告警': 'danger', 
    '高级告警': 'warning', 
    '中级告警': '', 
    '低级告警': 'success' 
  }
  return map[level] || ''
}

const getLevelLabel = (level) => {
  return level // 直接显示值，因为已经使用中文
}

const getStatusTagType = (status) => {
  const map = { pending: 'danger', confirmed: 'warning', closed: 'success' }
  return map[status] || ''
}

const getStatusLabel = (status) => {
  const map = { pending: '未处理', confirmed: '已确认', closed: '已关闭' }
  return map[status] || status
}

const showDetail = (alert) => {
  currentAlert.value = alert
  detailVisible.value = true
}

const confirmAlert = (alert) => {
  alert.status = 'confirmed'
}

const markAsFalse = (alert) => {
  alert.status = 'closed'
}

const escalateAlert = (alert) => {
  alert.level = 'critical'
}

const closeAlert = (alert) => {
  alert.status = 'closed'
}

const currentPage = ref(1)
const pageSize = ref(10)
const totalAlerts = computed(() => rules.value.length)  // 修改为rules

// 移除未使用的变量和方法
const paginatedAlerts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredAlerts.value.slice(start, end)
})
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

.filter-area {
  display: flex;
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