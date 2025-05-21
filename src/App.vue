<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-content">
        <div class="logo-container">
          <el-icon class="logo-icon" :size="24"><Monitor /></el-icon>
          <h1 class="logo-text">Net Sentinel</h1>
        </div>
        <div v-if="userStore.isLoggedIn" class="user-info">
          <el-dropdown>
            <span class="user-dropdown">
              {{userStore.username}}
              <el-icon><User /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <el-button v-else type="primary" @click="goToLogin" class="login-button">登录</el-button>
      </div>
    </el-header>
    <el-container>
      <el-aside v-if="userStore.isLoggedIn" width="200px" class="aside">
        <el-menu
          :default-active="activeMenu"
          class="menu"
          @select="handleSelect"
          :router="true"
        >
          <el-menu-item index="/introduce">
            <el-icon><InfoFilled /></el-icon>
            <span>系统介绍</span>
          </el-menu-item>
          <el-menu-item index="/dashboard">
            <el-icon><Bell /></el-icon>
            <span>实时告警</span>
          </el-menu-item>
          <el-menu-item index="/rules">
            <el-icon><Document /></el-icon>
            <span>日志查询</span>
          </el-menu-item>
          <el-menu-item index="/alerts">
            <el-icon><Bell /></el-icon>
            <span>告警管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="main-content">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { Monitor, Setting, User, InfoFilled, Document, Bell } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from './store/user'
import { computed, watch, onMounted } from 'vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 监听用户信息变化
watch(() => userStore.userInfo, (newUserInfo) => {
  console.log('用户信息已更新:', newUserInfo)
}, { deep: true })

// 在组件挂载时打印用户信息
onMounted(() => {
  console.log('当前用户信息:', userStore.userInfo)
  console.log('用户名:', userStore.username)
  console.log('登录状态:', userStore.isLoggedIn)
})

const activeMenu = computed(() => route.path)

const goToLogin = () => {
  router.push('/login')
}

const handleSelect = (index) => {
  router.push(index)
}

const handleLogout = () => {
  userStore.clearUserInfo()
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
  background-color: #f6f8fa;
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
  width: 100%;
  padding: 0 16px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  color: #ffffff;
}

.logo-text {
  color: #ffffff;
  font-size: 20px;
  margin: 0;
}

.aside {
  background-color: #ffffff;
  border-right: 1px solid #d0d7de;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.menu {
  border-right: none;
  padding: 12px 0;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-dropdown:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-icon {
  margin-right: 4px;
}

.login-button {
  background-color: #2da44e;
  border: 1px solid rgba(27, 31, 36, 0.15);
  color: #ffffff;
  font-weight: 500;
  padding: 5px 16px;
  border-radius: 6px;
}

.login-button:hover {
  background-color: #2c974b;
}

:deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  margin: 4px 0;
}

:deep(.el-menu-item.is-active) {
  background-color: #f6f8fa;
  border-right: 2px solid #0969da;
}

:deep(.el-menu-item:hover) {
  background-color: #f6f8fa;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  cursor: pointer;
}

.user-dropdown:hover {
  opacity: 0.8;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 8px;
}

.logo-icon {
  font-size: 36px;
  color: #ffffff;
}

.logo-text {
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.5px;
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