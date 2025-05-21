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
                <div class="stat-label">{{ stat.label }}</div>
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
          <el-table-column prop="time" label="时间" width="180" />
          <el-table-column prop="level" label="级别" width="100">
            <template #default="{ row }">
              <el-tag :type="getLevelType(row.level)" size="small">
                <div style="display: flex; align-items: center; gap: 5px;">
                  <div class="alert-level-icon" :style="{ backgroundColor: getLevelColor(row.level) }"></div>
                  {{ row.level }}
                </div>
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="device" label="设备" width="150" />
          <el-table-column prop="description" label="描述" />
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
const alertList = ref([
  { time: '2024-01-20 10:30:00', level: '严重', device: 'Server-01', description: '服务器CPU使用率超过95%' },
  { time: '2024-01-20 10:25:00', level: '高级', device: 'Switch-02', description: '网络带宽使用率达到峰值' },
  { time: '2024-01-20 10:20:00', level: '中级', device: 'Router-03', description: '设备温度异常' },
  { time: '2024-01-20 10:15:00', level: '低级', device: 'Server-04', description: '磁盘使用空间超过80%' }
])

// 获取告警级别对应的颜色
const getLevelColor = (level) => {
  const colors = {
    '严重': '#cf222e',
    '高级': '#bc4c00',
    '中级': '#9a6700',
    '低级': '#1a7f37'
  }
  return colors[level] || '#1a7f37'
}

// 获取告警级别对应的Tag类型
const getLevelType = (level) => {
  const types = {
    '严重': 'danger',
    '高级': 'warning',
    '中级': '',
    '低级': 'success'
  }
  return types[level] || 'info'
}

// 刷新告警列表
const refreshAlerts = () => {
  // TODO: 实现告警数据刷新逻辑
  console.log('刷新告警列表')
}

// 查看告警详情
const handleDetail = (row) => {
  console.log('查看告警详情:', row)
}

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['严重告警', '高级告警', '中级告警', '低级告警'],
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
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '严重告警',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: { focus: 'series' },
        data: [2, 3, 5, 4, 3, 2, 1],
        itemStyle: { color: '#cf222e' }
      },
      {
        name: '高级告警',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: { focus: 'series' },
        data: [5, 7, 10, 8, 6, 5, 4],
        itemStyle: { color: '#bc4c00' }
      },
      {
        name: '中级告警',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: { focus: 'series' },
        data: [10, 12, 15, 13, 11, 9, 8],
        itemStyle: { color: '#9a6700' }
      },
      {
        name: '低级告警',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: { focus: 'series' },
        data: [15, 18, 20, 17, 15, 13, 12],
        itemStyle: { color: '#1a7f37' }
      }
    ]
  }

  trendChart.setOption(option)
}

// 监听时间范围变化
const handleTimeRangeChange = () => {
  // TODO: 根据选择的时间范围更新图表数据
  console.log('时间范围改变:', timeRange.value)
}

onMounted(() => {
  initTrendChart()
  window.addEventListener('resize', () => {
    trendChart?.resize()
  })
})

onUnmounted(() => {
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
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.25;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #57606a;
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
</style>