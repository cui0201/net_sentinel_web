import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Introduce.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/introduce',
      name: 'introduce',
      component: () => import('../views/Introduce.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/rules',
      name: 'rules',
      component: () => import('../views/Rule.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/alerts',
      name: 'alerts',
      component: () => import('../views/Alert.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  console.log('路由守卫 - 当前路由:', to.path)
  console.log('路由守卫 - 登录状态:', userStore.isLoggedIn)
  
  // 检查用户是否已登录
  const isLoggedIn = userStore.isLoggedIn
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    // 需要登录权限但未登录，跳转到登录页
    console.log('路由守卫 - 需要登录权限，跳转到登录页')
    next('/login')
  } else if (isLoggedIn && to.path === '/login') {
    // 已登录用户访问登录页，重定向到介绍页
    console.log('路由守卫 - 已登录，从登录页跳转到介绍页')
    next('/introduce')
  } else {
    // 其他情况正常放行
    console.log('路由守卫 - 正常放行')
    next()
  }
})

export default router