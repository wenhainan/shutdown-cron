/*
 * @Author: 闻海南 whndeweilai@163.com
 * @Date: 2026-03-24 13:14:20
 * @LastEditors: 闻海南 whndeweilai@163.com
 * @LastEditTime: 2026-03-24 13:37:25
 * @FilePath: \shutdown-cron\vite.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',  // 使用相对路径
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})