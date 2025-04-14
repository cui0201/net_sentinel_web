import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
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
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  console.log('路由守卫 - 当前路由:', to.path)
  console.log('路由守卫 - 登录状态:', userStore.isLoggedIn)
  console.log('路由守卫 - 用户信息:', userStore.userInfo)
  console.log('路由守卫 - Token:', userStore.token)
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    console.log('路由守卫 - 需要登录权限，跳转到登录页')
    next('/login')
  } else if (userStore.isLoggedIn && to.path === '/login') {
    console.log('路由守卫 - 已登录，从登录页跳转到仪表盘')
    next('/dashboard')
  } else if (userStore.isLoggedIn && to.path === '/') {
    console.log('路由守卫 - 已登录，从首页跳转到仪表盘')
    next('/dashboard')
  } else {
    console.log('路由守卫 - 正常放行')
    next()
  }
})

export default router