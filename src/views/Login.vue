<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <el-button link @click="goToHome" :icon="Back" class="back-button">返回主页</el-button>
          <span>{{ isLogin ? '登录' : '注册' }}</span>
        </div>
      </template>
      <el-dialog
        v-model="dialogVisible"
        :title="isLogin ? '登录' : '注册'"
        width="480px"
        :show-close="false"
        :close-on-click-modal="false"
        class="login-dialog"
      >
        <el-form :model="formData" :rules="rules" ref="formRef">
          <el-form-item prop="username">
            <el-input v-model="formData.username" placeholder="用户名" prefix-icon="User" class="github-input" />
          </el-form-item>
          <el-form-item prop="email" v-if="!isLogin">
            <el-input v-model="formData.email" placeholder="邮箱" prefix-icon="Message" class="github-input" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="formData.password" type="password" placeholder="密码" prefix-icon="Lock" class="github-input" />
          </el-form-item>
          <el-form-item v-if="!isLogin" prop="confirmPassword">
            <el-input v-model="formData.confirmPassword" type="password" placeholder="确认密码" prefix-icon="Lock" class="github-input" />
          </el-form-item>
          <el-form-item>
            <el-button 
  type="primary" 
  @click="handleSubmit" 
  class="submit-button"
  :loading="isLoading"
  :disabled="isLoading"
>{{ isLogin ? '登录' : '注册' }}</el-button>
          </el-form-item>
          <div class="form-footer">
            <el-button link @click="toggleMode" class="toggle-button">{{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}</el-button>
          </div>
        </el-form>
        <template #footer>
          <el-button link @click="closeDialog" class="close-button">返回主页</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Back, Message } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const isLogin = ref(true)
const dialogVisible = ref(true)
const isLoading = ref(false)

const closeDialog = () => {
  dialogVisible.value = false
  router.push('/')
}

const goToHome = () => {
  router.push('/')
}

const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    isLoading.value = true
    
    try {
      const url = isLogin.value ? '/api/user/login' : '/api/user/register'
      const response = await axios.post(url, {
        username: formData.username,
        ...(isLogin.value ? {} : { email: formData.email }),
        password: formData.password
      })

      if (response.data.code === 200) {
        if (isLogin.value) {
          userStore.setUserInfo(response.data.data?.nsUserDO || {})
          userStore.setToken(response.data.data?.token || '')
          
          // 打印用户信息
          console.log('登录成功，用户信息:', userStore.userInfo)
          
          ElMessage.success('登录成功')
          await router.push('/dashboard')
        } else {
          ElMessage.success('注册成功')
          isLogin.value = true
          formRef.value?.resetFields()
        }
      } else {
        ElMessage.error(response.data.message || '操作失败')
      }
    } catch (error) {
      const message = error.response?.data?.message || '请求失败，请稍后重试'
      ElMessage.error(message)
    } finally {
      isLoading.value = false
    }
  } catch (formError) {
    console.error('表单验证失败:', formError)
  }
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  formRef.value?.resetFields()
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  padding: 24px 0;
}

.login-card {
  width: min(480px, 90%);
  margin: 0;
  border-radius: 8px;
  border: 1px solid #d0d7de;
  box-shadow: 0 2px 6px rgba(27, 31, 36, 0.12);
}

:deep(.el-card__header) {
  background-color: #f6f8fa;
  border-bottom: 1px solid #d0d7de;
  padding: 20px 32px;
}

:deep(.el-card__body) {
  padding: 32px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 20px;
  font-weight: 600;
  color: #24292f;
}

.back-button {
  font-size: 14px;
  color: #0969da;
}

.back-button:hover {
  color: #0969da;
  text-decoration: underline;
}

:deep(.github-input .el-input__wrapper) {
  background-color: #f6f8fa;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  box-shadow: none;
}

:deep(.github-input .el-input__wrapper:hover) {
  border-color: #0969da;
}

:deep(.github-input .el-input__wrapper.is-focus) {
  border-color: #0969da;
  box-shadow: 0 0 0 2px rgba(9, 105, 218, 0.3);
}

.submit-button {
  width: 100%;
  background-color: #2da44e;
  border: 1px solid rgba(27, 31, 36, 0.15);
  color: #ffffff;
  font-weight: 500;
  height: 40px;
  font-size: 16px;
  border-radius: 6px;
}

.submit-button:hover {
  background-color: #2c974b;
}

.form-footer {
  text-align: center;
  margin-top: 16px;
}

.toggle-button {
  color: #343434;
  font-size: 14px;
}

.toggle-button:hover {
  color: #2f2f30;
  text-decoration: underline;
}

:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 24px 32px;
  background: linear-gradient(135deg, #393939, #030303);
  color: #ffffff;
}

:deep(.el-dialog__title) {
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  padding: 32px;
  background-color: #ffffff;
}

:deep(.el-dialog__footer) {
  padding: 16px 32px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

:deep(.github-input .el-input__wrapper) {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: none;
  transition: all 0.3s ease;
}

:deep(.github-input .el-input__wrapper:hover) {
  border-color: #121212;
}

:deep(.github-input .el-input__wrapper.is-focus) {
  border-color: #0e0e0e;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.2);
}

.submit-button {
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, #0c0c0c, #313131);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.submit-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3);
}

.form-footer {
  text-align: center;
  margin-top: 16px;
}

.toggle-button {
  color: #3b3c3c;
  font-size: 14px;
  transition: all 0.3s ease;
}

.toggle-button:hover {
  color: #212121;
  text-decoration: none;
  transform: translateY(-1px);
}

.close-button {
  color: #6c757d;
  font-size: 14px;
  transition: all 0.3s ease;
}

.close-button:hover {
  color: #343a40;
  transform: translateY(-1px);
}
</style>