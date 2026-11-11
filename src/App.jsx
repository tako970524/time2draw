// App.jsx：應用程式入口元件：管理目前頁面、工具選擇，組合首頁、模式選單與遊戲頁面。

// 匯入 useState：建立會觸發重新渲染的狀態。
import { useState } from "react"
// Canvas：共用繪圖畫布元件。
import Canvas from "./Canvas"
// ToolBar：共用工具列元件。
import ToolBar from "./ToolBar"
// BoxModeNormal：方體一般模式的遊戲頁。
import BoxModeNormal from "./BoxModeNormal"
// BoxModeInfinity：沿用原本持續出題的無限模式。
import BoxModeInfinity from "./BoxModeInfinity"
import CircleModeNormal from "./CircleModeNormal"
// StartScreen：開始畫面元件。
import StartScreen from "./StartScreen"
// ModeMenu：模式選單與卡片展開元件。
import ModeMenu from "./ModeMenu"
// PageTransition：共用頁面切換動畫元件。
import PageTransition from "./PageTransition"
import { loadToolShortcuts, shortcutStorageKey } from "./toolShortcuts"
// 載入此元件的 CSS 樣式。
import "./App.css"

// App：組合應用程式頁面，screen 控制顯示哪一頁。
function App() {
    // screen：目前頁面代號：start、menu、game、boxNormal 或 boxInfinity；setScreen：切換頁面。
    const [screen, setScreen] = useState("start")
    // currentTool：目前工具代號：brush、cursor 或 eraser；setCurrentTool：更新目前工具，由父元件傳給工具列及畫布。
    const [currentTool, setCurrentTool] = useState("cursor")
    const [shortcuts, setShortcuts] = useState(loadToolShortcuts)

    function saveShortcuts(nextShortcuts) {
        setShortcuts(nextShortcuts)
        try {
            window.localStorage.setItem(shortcutStorageKey, JSON.stringify(nextShortcuts))
            return true
        } catch {
            return false
        }
    }

    // openSubMode：destination：子模式的目的頁面；進入前切換到筆刷工具。
    function openSubMode(destination) {
        if (destination) {
            setCurrentTool("brush")
            setScreen(destination)
        }
    }

    return (
        <div className="App">
            {/* 共用切換動畫包住所有頁面；新增頁面時在下方增加 screen 對應元件。 */}
            <PageTransition pageKey={screen}>
                {/* 首頁與選單：只有切換頁面才更改 screen，卡片展開由 ModeMenu 管理。 */}
                {screen === "start" && <StartScreen onStart={() => /* 點選回呼：通知父元件切換頁面或工具，或更新展開狀態。 */ setScreen("menu")} />}
                {screen === "menu" && <ModeMenu onSelectSubMode={openSubMode} shortcuts={shortcuts} onSaveShortcuts={saveShortcuts} />}
                {screen === "game" && (
                    <div className="Game">
                        <ToolBar currentTool={currentTool} setCurrentTool={setCurrentTool} shortcuts={shortcuts} />
                        <div className="SketchWorkspace">
                            <header className="WorkspaceHeader">
                                <button onClick={() => /* 點選回呼：通知父元件切換頁面或工具，或更新展開狀態。 */ setScreen("menu")}>Back to modes</button>
                                <span>Sketch / Free Draw</span>
                            </header>
                            <div className="DrawingViewport"><Canvas currentTool={currentTool} /></div>
                        </div>
                    </div>
                )}
                {screen === "boxNormal" && (
                    <BoxModeNormal currentTool={currentTool} setCurrentTool={setCurrentTool} shortcuts={shortcuts}
                        onBack={() => /* 點選回呼：通知父元件切換頁面或工具，或更新展開狀態。 */ setScreen("menu")} />
                )}
                {screen === "boxInfinity" && (
                    <BoxModeInfinity currentTool={currentTool} setCurrentTool={setCurrentTool} shortcuts={shortcuts}
                        onBack={() => /* 退出無限練習，返回模式選單。 */ setScreen("menu")} />
                )}
                {screen === "circleNormal" && (
                    <CircleModeNormal currentTool={currentTool} setCurrentTool={setCurrentTool} shortcuts={shortcuts}
                        onBack={() => setScreen("menu")} />
                )}
            </PageTransition>
        </div>
    )
}

export default App
