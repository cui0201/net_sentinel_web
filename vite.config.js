import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    // 添加热更新配置
    hmr: {
      overlay: true,  // 错误覆盖层
      timeout: 2000   // 超时时间
    },
    // 添加自动打开浏览器
    open: true,
    // 添加文件更改时自动刷新
    watch: {
      usePolling: true,
      interval: 100
    }
  }
})