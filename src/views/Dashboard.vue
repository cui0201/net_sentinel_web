<template>
  <div class="dashboard-container">
    <!-- 告警监控部分 -->
    <div class="dashboard">
      <!-- 告警概览 -->
      <el-row :gutter="24" class="alert-overview">
        <el-col :span="6" v-for="(stat, index) in alertStats" :key="index">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <el-icon :style="{ color: stat.color, fontSize: '32px' }">
                <component :is="stat.icon" />
              </el-icon>
              <div class="stat-info">
                <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
                <div class="stat-label" :style="{ color: stat.color }">{{ stat.label }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 告警趋势图 -->
      <el-card class="chart-section">
        <template #header>
          <div class="chart-header">
            <div class="chart-title">告警趋势</div>
            <el-radio-group v-model="timeRange" size="small" @change="handleTimeRangeChange">
              <el-radio-button label="day">今日</el-radio-button>
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="trendChartRef" class="trend-chart"></div>
      </el-card>
      
      <!-- 最新告警列表 -->
      <el-card>
        <template #header>
          <div class="table-header">
            <div class="table-title">最新告警</div>
            <el-button type="primary" size="small" @click="refreshAlerts">刷新</el-button>
          </div>
        </template>
        <el-table :data="alertList" style="width: 100%" border>
          <el-table-column prop="alertTime" label="时间" width="180" />
          <el-table-column prop="alertGrade" label="级别" width="150">
            <template #default="{ row }">
              <el-tag :type="getLevelType(row.alertGrade)" size="small">
                <div style="display: flex; align-items: center; gap: 5px;">
                  <div class="alert-level-icon" :style="{ backgroundColor: getLevelColor(row.alertGrade) }"></div>
                  {{ row.alertGrade }}
                </div>
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="deviceName" label="设备" width="150" />
          <el-table-column prop="alertMsg" label="描述" />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button type="text" size="small" @click="handleDetail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { Monitor, Search, Setting, DataAnalysis } from '@element-plus/icons-vue'
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { Warning, Bell, CircleCheck, InfoFilled } from '@element-plus/icons-vue'
import axios from 'axios'
import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const timeRange = ref('day')
const trendChartRef = ref(null)
let trendChart = null

// 告警统计数据
const alertStats = ref([
  { label: '严重告警', value: 5, icon: 'Warning', color: '#cf222e' },
  { label: '高级告警', value: 12, icon: 'Bell', color: '#bc4c00' },
  { label: '中级告警', value: 28, icon: 'InfoFilled', color: '#9a6700' },
  { label: '低级告警', value: 45, icon: 'CircleCheck', color: '#1a7f37' }
])

// 告警列表数据
const alertList = ref([])

// 获取告警级别对应的颜色
const getLevelColor = (level) => {
  const colors = {
    '严重告警': '#cf222e',
    '高级告警': '#bc4c00',
    '中级告警': '#9a6700',
    '低级告警': '#1a7f37'
  }
  return colors[level] || '#1a7f37'
}

// 获取告警级别对应的Tag类型
const getLevelType = (level) => {
  const types = {
    '严重告警': 'danger',
    '高级告警': 'warning',
    '中级告警': '',
    '低级告警': 'success'
  }
  return types[level] || 'info'
}

// 查看告警详情
const handleDetail = async (row) => {
  try {
    const token = userStore.token
    if (!token) {
      ElMessage.error('未登录或登录已过期，请重新登录')
      router.push('/login')
      return
    }

    ElMessageBox.alert(
      `<div>
        <p><strong>告警ID：</strong>${row.id}</p>
        <p><strong>告警级别：</strong>${row.alertGrade}</p>
        <p><strong>设备名称：</strong>${row.deviceName}</p>
        <p><strong>源IP：</strong>${row.sourceIp}</p>
        <p><strong>告警时间：</strong>${row.alertTime}</p>
        <p><strong>告警描述：</strong>${row.alertMsg}</p>
      </div>`,
      '告警详情',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        customClass: 'alert-detail-dialog'
      }
    )
  } catch (error) {
    console.error('查看告警详情失败:', error)
    ElMessage.error('查看告警详情失败')
  }
}

// 刷新告警列表
const refreshAlerts = async () => {
  try {
    const token = userStore.token
    if (!token) {
      ElMessage.error('未登录或登录已过期，请重新登录')
      router.push('/login')
      return
    }

    const response = await axios.get('/api/alert/queryPageAlert', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.data.code === 200) {
      alertList.value = response.data.data
    } else {
      ElMessage.error(response.data.message || '获取告警列表失败')
    }
  } catch (error) {
    console.error('获取告警列表失败:', error)
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
    } else {
      ElMessage.error('获取告警列表失败')
    }
  }
}

// 图表数据
const chartData = ref({
  series: [],
  xaxis: {
    day: [],
    week: [],
    month: []
  }
})

// 获取趋势图数据
const fetchChartData = async () => {
  try {
    const token = userStore.token
    if (!token) {
      ElMessage.error('未登录或登录已过期，请重新登录')
      router.push('/login')
      return
    }

    const response = await axios.get('/api/alert/queryTheTrendChart', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.data.code === 200) {
      chartData.value = response.data.data
      updateChart()
    } else {
      ElMessage.error(response.data.message || '获取趋势图数据失败')
    }
  } catch (error) {
    console.error('获取趋势图数据失败:', error)
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
    } else {
      ElMessage.error('获取趋势图数据失败')
    }
  }
}

// 更新图表
const updateChart = () => {
  if (!trendChart || !chartData.value) return

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: chartData.value.series.map(item => item.name),
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.value.xaxis[timeRange.value]
    },
    yAxis: {
      type: 'value'
    },
    series: chartData.value.series.map(item => {
      return {
        name: item.name,
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: { focus: 'series' },
        data: item[timeRange.value],
        itemStyle: { color: getLevelColor(item.name) }  // 直接使用完整的告警级别名称
      }
    })
  }

  trendChart.setOption(option)
}

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)
  fetchChartData() // 获取初始数据
}

// 监听时间范围变化
const handleTimeRangeChange = () => {
  updateChart() // 更新图表显示
}

// 获取告警统计数据
const fetchAlertStats = async () => {
  try {
    const token = userStore.token
    if (!token) {
      ElMessage.error('未登录或登录已过期，请重新登录')
      router.push('/login')
      return
    }

    const response = await axios.get('/api/alert/queryAlertCount', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.data.code === 200) {
      // 将后端数据转换为数组格式
      alertStats.value = Object.values(response.data.data)
    } else {
      ElMessage.error(response.data.message || '获取告警统计数据失败')
    }
  } catch (error) {
    console.error('获取告警统计数据失败:', error)
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
    } else {
      ElMessage.error('获取告警统计数据失败')
    }
  }
}

// 定时器变量
let refreshTimer = null

// 启动定时刷新
const startAutoRefresh = () => {
// 先清除可能存在的定时器
if (refreshTimer) {
clearInterval(refreshTimer)
}

// 设置新的定时器，每5秒刷新一次
refreshTimer = setInterval(() => {
fetchAlertStats()    // 刷新告警统计
fetchChartData()     // 刷新趋势图
refreshAlerts()      // 刷新告警列表
}, 5000)
}

// 停止定时刷新
const stopAutoRefresh = () => {
if (refreshTimer) {
clearInterval(refreshTimer)
refreshTimer = null
}
}

// 组件挂载时初始化
onMounted(() => {
fetchAlertStats()
initTrendChart()
refreshAlerts()
startAutoRefresh() // 启动自动刷新
window.addEventListener('resize', () => {
trendChart?.resize()
})
})

// 组件卸载时清理
onUnmounted(() => {
stopAutoRefresh() // 停止自动刷新
window.removeEventListener('resize', () => {
trendChart?.resize()
})
trendChart?.dispose()
})
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
}

.welcome-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.system-intro {
  line-height: 1.6;
}

.system-intro h3 {
  margin-top: 25px;
  margin-bottom: 15px;
  color: #409EFF;
}

.feature-card {
  height: 100%;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-header {
  display: flex;
  align-items: center;
}

.feature-header .el-icon {
  margin-right: 8px;
  font-size: 18px;
  color: #409EFF;
}

.footer-info {
  text-align: center;
  color: #909399;
  font-size: 14px;
  margin-top: 20px;
}

.alert-overview {
  margin-bottom: 24px;
}

.stat-card {
  background-color: #ffffff;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.25;
}

.stat-label {
  font-size: 15px;
  color: #57606a;
  font-weight: 500;
}

.chart-section {
  margin-bottom: 24px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #24292f;
}

.trend-chart {
  height: 400px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #24292f;
}

.alert-level-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0 auto;
}

:deep(.el-card) {
  border-radius: 8px;
  border: 1px solid #d0d7de;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #d0d7de;
}

:deep(.el-table) {
  --el-table-border-color: #d0d7de;
  --el-table-header-bg-color: #f6f8fa;
  --el-table-row-hover-bg-color: #f6f8fa;
}

:deep(.el-table th) {
  font-weight: 600;
  color: #24292f;
}

:deep(.el-table td) {
  color: #57606a;
}

:deep(.alert-detail-dialog) {
  .el-message-box__content {
    padding: 20px;
  }
  p {
    margin: 8px 0;
    line-height: 1.5;
  }
  strong {
    color: #24292f;
    font-weight: 600;
    margin-right: 8px;
  }
}
</style>