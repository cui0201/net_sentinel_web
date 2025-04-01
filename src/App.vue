<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-content">
        <div class="logo-container">
          <el-icon class="logo-icon"><Bell /></el-icon>
          <h1>Net Sentinel</h1>
        </div>
        <el-button type="primary" @click="goToLogin" class="login-button">登录</el-button>
      </div>
    </el-header>
    <el-main class="main-content">
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script setup>
import { Bell } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background-color: #ffffff;
  overflow: hidden;
}

.main-content {
  max-width: 100%;
  margin: 0 auto;
  padding: 24px 32px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.main-content::-webkit-scrollbar {
  display: none;
}

.header {
  background-color: #24292f;
  padding: 0 32px;
  height: 64px !important;
  line-height: 64px;
  border-bottom: 1px solid #d0d7de;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
  color: #ffffff;
}

h1 {
  margin: 0;
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.login-button {
  background-color: #2da44e;
  border: 1px solid rgba(27, 31, 36, 0.15);
  color: #ffffff;
  font-weight: 500;
  padding: 5px 16px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: #2c974b;
}
</style>