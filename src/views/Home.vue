<template>
  <div class="home">
    <div class="header-actions">
      <el-button type="primary" @click="goToLogin" :style="loginButtonStyle">登录</el-button>
    </div>
    <el-row :gutter="24">
      <el-col :span="12">
        <div class="intro-section">
          <h1 class="main-title">智能网络告警系统</h1>
          <h2 class="sub-title">实时监控，精准预警，保障网络安全稳定运行</h2>
          <div class="intro-content">
            <p>本系统采用先进的网络监控技术，能够实时采集网络设备数据，对潜在的告警信息进行智能分析和预测，及时发出告警通知，帮助网络管理员快速定位和解决问题，确保网络的稳定运行。</p>
            <p>系统具备高可扩展性，可适应不同规模的网络环境，广泛应用于企业、数据中心、通信运营商等领域。</p>
          </div>
          <div class="features-grid">
            <div class="feature-item" v-for="(feature, index) in features" :key="index">
              <el-icon :size="48" :color="'#0969da'">
                <component :is="feature.icon" />
              </el-icon>
              <span class="feature-text">{{ feature.text }}</span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="alert-section">
          <div class="alert-stats">
            <div class="stats-header">
              <span class="total-alerts">当前告警总数：{{ totalAlerts }}</span>
              <span class="distribution-title">告警级别分布</span>
            </div>
          </div>
          <div ref="chartRef" class="chart-container"></div>
          <div class="alert-list">
            <h3 class="list-title">最新告警信息</h3>
            <el-table :data="alertList" style="width: 100%" @row-click="handleAlertClick">
              <el-table-column width="50">
                <template #default="{ row }">
                  <div class="alert-level-icon" :style="{ backgroundColor: getLevelColor(row.level) }"></div>
                </template>
              </el-table-column>
              <el-table-column prop="time" label="时间" width="180" />
              <el-table-column prop="level" label="级别" width="100" />
              <el-table-column prop="device" label="设备" width="120" />
              <el-table-column prop="description" label="描述" />
            </el-table>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { Monitor, Bell, DataAnalysis, Setting } from '@element-plus/icons-vue'

const router = useRouter()
const chartRef = ref(null)
let chart = null

const loginButtonStyle = {
  backgroundColor: '#2da44e',
  border: '1px solid rgba(27, 31, 36, 0.15)',
  color: '#ffffff',
  fontWeight: '500',
  padding: '5px 16px',
  borderRadius: '6px'
}

const features = [
  { icon: 'Monitor', text: '实时监控' },
  { icon: 'Bell', text: '精准告警' },
  { icon: 'DataAnalysis', text: '智能分析' },
  { icon: 'Setting', text: '高效管理' }
]

const totalAlerts = ref(156)

const alertList = ref([
  { time: '2024-01-20 10:30:00', level: '严重', device: 'Server-01', description: '服务器CPU使用率超过95%' },
  { time: '2024-01-20 10:25:00', level: '高级', device: 'Switch-02', description: '网络带宽使用率达到峰值' },
  { time: '2024-01-20 10:20:00', level: '中级', device: 'Router-03', description: '设备温度异常' },
  { time: '2024-01-20 10:15:00', level: '低级', device: 'Server-04', description: '磁盘使用空间超过80%' }
])

const getLevelColor = (level) => {
  const colors = {
    '严重': '#cf222e',
    '高级': '#bc4c00',
    '中级': '#9a6700',
    '低级': '#1a7f37'
  }
  return colors[level] || '#1a7f37'
}

const goToLogin = () => {
  router.push('/login')
}

const handleAlertClick = (row) => {
  console.log('查看告警详情:', row)
}

const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)
  const option = {
    title: {
      text: '告警级别分布',
      textStyle: {
        color: '#24292f',
        fontSize: 16,
        fontWeight: '600'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['告警数量', '年度趋势'],
      bottom: 0,
      textStyle: {
        color: '#57606a'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['严重告警', '高级告警', '中级告警', '低级告警'],
      axisLabel: {
        color: '#57606a'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#57606a'
      }
    },
    series: [
      {
        name: '告警数量',
        type: 'bar',
        data: [
          { value: 20, itemStyle: { color: '#cf222e' } },
          { value: 35, itemStyle: { color: '#bc4c00' } },
          { value: 45, itemStyle: { color: '#9a6700' } },
          { value: 56, itemStyle: { color: '#1a7f37' } }
        ],
        barWidth: '40%'
      },
      {
        name: '年度趋势',
        type: 'line',
        data: [25, 38, 42, 50],
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#0969da',
          width: 2
        },
        itemStyle: {
          color: '#0969da'
        }
      }
    ]
  }

  chart.setOption(option)
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => {
    chart?.resize()
  })
})
</script>

<style scoped>
.home {
  padding: 24px 0;
  position: relative;
}

.header-actions {
  position: absolute;
  top: 24px;
  right: 0;
}

.intro-section {
  padding: 24px 0;
}

.main-title {
  font-size: 32px;
  color: #24292f;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.25;
}

.sub-title {
  font-size: 20px;
  color: #57606a;
  font-weight: normal;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.intro-content {
  color: #24292f;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 24px;
}

.intro-content p {
  margin-bottom: 16px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 24px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background-color: #f6f8fa;
  border-radius: 6px;
  border: 1px solid #d0d7de;
}

.feature-text {
  color: #24292f;
  font-size: 16px;
  font-weight: 500;
}

.alert-section {
  background-color: #ffffff;
  border-radius: 6px;
  border: 1px solid #d0d7de;
}

.alert-stats {
  background-color: #f6f8fa;
  padding: 16px 24px;
  border-bottom: 1px solid #d0d7de;
  border-radius: 6px 6px 0 0;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-alerts,
.distribution-title {
  color: #24292f;
  font-size: 16px;
  font-weight: 600;
}

.chart-container {
  height: 300px;
  padding: 24px;
}

.alert-list {
  padding: 24px;
}

.list-title {
  font-size: 16px;
  color: #24292f;
  font-weight: 600;
  margin-bottom: 16px;
}

.alert-level-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0 auto;
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