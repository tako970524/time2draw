// eslint.config.js：ESLint 靜態檢查設定：指定檢查檔案、JavaScript 規則、React Hooks 與瀏覽器環境。

// 匯入 js：ESLint 的 JavaScript 建議規則。
import js from '@eslint/js'
// 匯入 globals：各執行環境的全域變數清單。
import globals from 'globals'
// 匯入 reactHooks：React Hooks 使用規則。
import reactHooks from 'eslint-plugin-react-hooks'
// 匯入 reactRefresh：React 熱更新相容性規則。
import reactRefresh from 'eslint-plugin-react-refresh'
// 匯入 defineConfig：提供設定檔結構與編輯器提示；globalIgnores：全域忽略不需檢查的檔案。
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // dist：Vite 產生的建置檔案，不需檢查生成的程式碼。
  globalIgnores(['dist']),
  {
    // files：套用以下規則的來源檔案範圍。
    files: ['**/*.{js,jsx}'],
    // extends：沿用 JavaScript、Hooks 與 React 熱更新的建議規則。
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    // languageOptions：指定執行環境及可使用的語法。
    languageOptions: {
      // globals：允許 window、document 等瀏覽器全域變數。
      globals: globals.browser,
      // parserOptions／ecmaFeatures／jsx：允許解析 JSX 元件語法。
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
