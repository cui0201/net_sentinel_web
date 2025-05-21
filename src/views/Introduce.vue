<template>
  <div class="introduce-container">
    <!-- 系统介绍部分 -->
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <h2>欢迎使用网络安全监控系统</h2>
        </div>
      </template>
      <div class="system-intro">
        <h3>系统简介</h3>
        <p>网络安全监控系统是一个专为企业和组织设计的全方位网络安全解决方案。本系统通过实时监控网络流量、分析潜在威胁并提供及时告警，帮助您保护关键资产和数据安全。</p>
        
        <h3>核心功能</h3>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="feature-card">
              <template #header>
                <div class="feature-header">
                  <el-icon><Monitor /></el-icon>
                  <span>实时告警监控</span>
                </div>
              </template>
              <p>24/7不间断监控网络流量，实时检测异常行为和潜在威胁，第一时间发出告警通知。</p>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="feature-card">
              <template #header>
                <div class="feature-header">
                  <el-icon><Search /></el-icon>
                  <span>日志查询分析</span>
                </div>
              </template>
              <p>强大的日志查询和分析功能，支持多维度筛选和高级搜索，快速定位安全事件。</p>
            </el-card>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card class="feature-card">
              <template #header>
                <div class="feature-header">
                  <el-icon><Setting /></el-icon>
                  <span>告警规则管理</span>
                </div>
              </template>
              <p>灵活配置告警规则，根据企业需求自定义检测策略，减少误报同时提高检出率。</p>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="feature-card">
              <template #header>
                <div class="feature-header">
                  <el-icon><DataAnalysis /></el-icon>
                  <span>可视化数据展示</span>
                </div>
              </template>
              <p>直观的数据可视化展示，通过图表和仪表盘清晰呈现网络安全态势。</p>
            </el-card>
          </el-col>
        </el-row>
        
        <h3 style="margin-top: 30px;">开始使用</h3>
        <p>请点击上方导航栏的相应功能模块，开始使用网络安全监控系统。如需帮助，请联系系统管理员。</p>
        
        <el-divider />
        
        <div class="footer-info">
          <p>网络安全监控系统 v1.0.0 | © 2023 版权所有</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { Monitor, Search, Setting, DataAnalysis } from '@element-plus/icons-vue'
</script>

<style scoped>
.introduce-container {
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
</style>