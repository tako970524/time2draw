// main.jsx：React 啟動檔：將 App 掛載到 index.html 的 root；StrictMode 在開發時協助檢查副作用。

// 匯入 StrictMode：開發時檢查元件副作用。
import { StrictMode } from 'react'
// 匯入 createRoot：建立 React 掛載根節點。
import { createRoot } from 'react-dom/client'
// App：應用程式的頁面與狀態入口。
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
