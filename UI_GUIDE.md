# UI 修改指南

## 模式與子模式

修改 `src/menuConfig.js`：每個模式有 `id`、`title` 和 `subModes`。

- `title`：按鈕顯示文字。
- `screen`：進入的頁面，目前有 `boxNormal`、`boxInfinity`、`circleNormal` 與 `game`。
- `screen: null`：顯示 Coming soon 並停用，之後功能做好再指定頁面。

新增遊戲頁面時，除了設定 `screen`，也在 `src/App.jsx` 加上對應元件。

`ModeMenu.jsx` 負責展開與收合；`SubModeMenu.jsx` 負責展開區域裡的子模式按鈕。再次點選同一模式或按 Esc 可收合。

## 工具快捷鍵

繪圖頁面預設使用 **B** 切換 Brush Tool、**E** 切換 Eraser Tool、**V** 切換 Cursor Tool，不分大小寫。主選單的「快捷鍵設定」可更改為任一英文字母或數字，三個工具不可使用相同按鍵。按「儲存設定」後生效並保存於目前瀏覽器；「恢復預設」後再儲存即可回到 B／E／V，取消或 Esc 則放棄修改。

`toolShortcuts.js` 集中管理預設值、驗證及讀取；`ShortcutSettings.jsx` 與 `ShortcutSettings.css` 負責設定視窗。`ToolBar.jsx` 共用鍵盤監聽與按鈕提示，輸入文字、使用 Ctrl／Alt／Meta 組合鍵及頁面切換期間不觸發。

## 平行四邊形版面

修改 `src/MainMenu.css` 最上方 `.ModeMenu` 的變數：

- `--card-width`：收合時的寬度，也就是模式名稱區域。
- `--panel-width`：向右展開增加的寬度。
- `--card-slant`：平行四邊形傾斜程度。
- `--menu-gap`：卡片間距。
- `--expand-duration`：展開動畫時間。

右邊卡片會隨選中卡片的寬度一起移動。小螢幕保留橫向選單，可左右捲動；展開完成後會自動將該卡片移入可見範圍。

## 通用頁面切換動畫與 AE 素材

元件：`src/PageTransition.jsx`。排版及預設 CSS 動畫：`src/PageTransition.css`。

修改 `PageTransition.jsx` 裡的 `transitionConfig`：

```js
const transitionConfig = {
    durationMs: 1500,
    mediaSrc: "/animations/page-transition.webm",
    mediaType: "video",
    label: "Loading",
}
```

將 AE 動畫匯出成瀏覽器支援的 MP4/WebM，放到 `public/animations/`。也支援 GIF、APNG 或 SVG 圖片，設定 `mediaType: "image"`。透明影片可使用支援透明度的 WebM；實際支援度依瀏覽器而定。AE 專案檔 `.aep` 不能直接播放，Lottie JSON 需之後另接播放器。

`durationMs` 決定切換遮罩停留與淡出的總時間，建議配合素材長度調整。`mediaSrc` 留空或素材載入失敗時使用預設動畫；可直接修改 `PageTransitionContent` 及其 CSS 替換布局。這是頁面切換效果，尚未連接網路資料載入狀態。

只有 `pageKey` 改變才播放；選單展開、換工具、送出與下一題不會觸發。首頁保留原本的 Touch to start，首次連線不顯示切換遮罩。切換時暫停底下頁面的滑鼠與鍵盤互動。系統設定減少動態效果時略過動畫。

## 響應式繪圖區與全域樣式

`src/App.css` 的 `:root` 集中設定背景、文字、間距與工具列大小。

`src/StartScreen.css` 設定首頁字體及間距；`src/BoxMode.css` 設定遊戲控制區和 `DrawingViewport`。

繪圖區維持正方形並配合可用寬度、高度縮放。手機窄螢幕工具列改成橫向；繪圖與參考 canvas 一起縮放。內部 `1000 × 1000` 解析度保留，避免影響既有方體投影、筆跡及評分資料；這是資料座標，不是固定畫面大小。

指標座標沿用既有 `getPointerPosition` 轉換，橡皮擦游標會同步縮放。修改畫布版面時請保持 `.Canvas` 和 `.BoxModeReference` 的大小及位置一致。

## Boxes 題組與結算

`BoxModeNormal.jsx` 設定 Normal 的 `normalRoundLimit = 10`；`BoxModeInfinity.jsx` 使用 `roundLimit={null}` 持續出題。`BoxGame.jsx` 提供方體設定，共用流程位於 `PracticeGame.jsx`，包含出題、送出評分與下一題函式。

Normal 最後一題送出後先保留分數、答案與透視，按「查看結算」才進入結算頁。重試會清空成績與筆跡，重新隨機產生一組題目；退出返回模式選單。

`RoundSummary.jsx` 負責平均分數、各題成績與操作；`RoundSummary.css` 負責結算布局與預設進場動畫。平均值使用全部題目的得分並顯示至小數第一位。答題標題、進度、成績列及按鈕樣式位於 `BoxMode.css` 的 `.BoxGame` 相關區塊。

可在 `PracticeGame.jsx` 的 `RoundSummary` 呼叫中加入 `animationSlot` 替換預設裝飾，例如：

```jsx
animationSlot={<video src="/animations/round-complete.webm" autoPlay muted playsInline />}
```

素材放在 `public/animations/`，可使用影片、動圖或日後新增的動畫播放器。結算與重試的頁面切換沿用 `PageTransition`，不需要重寫載入動畫。

## Circles Normal

從 Circles → Normal 進入，每組 10 題。第 1～5 題提供大小不同的正方形，畫出四邊相切的內切圓；第 6～10 題提供長寬不等的矩形，畫出四邊中點相切的內切橢圓。矩形會隨機採用直向或橫向。

`CircleModeNormal.jsx` 設定題數、文案與評分；`circleGeometry.js` 產生尺寸和中心座標；`CircleGenerator.jsx` 繪製題目。送出後 `CircleAnswer.jsx` 在玩家筆跡上方疊加綠色曲線及藍色虛線十字，所有圖層一起旋轉、平移和縮放。下一題會清空筆跡、復原歷史和畫布視角，第十題查看答案後可進入結算或重試。

`scoreCircle.js` 將圓／橢圓取樣成短曲線段，沿用完整度、準確度及墨跡過量扣分。評分只讀取 1000 × 1000 玩家畫布，不包含題目或答案圖層，亦不受縮放與旋轉影響。執行 `node --test tests/circles.test.mjs` 可驗證出題和評分。
