// vite.config.js：Vite 開發與建置設定：目前使用 React 外掛，新增建置選項可在 defineConfig 內調整。

// 匯入 react：Vite 的 React 編譯外掛。
import react from '@vitejs/plugin-react'
// 匯入 defineConfig：提供設定檔結構與編輯器提示。
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // plugins：編譯外掛清單；react() 處理 React 元件與開發時的熱更新。
  plugins: [react()],
})
