// ModeMenu.jsx：主模式選單：管理平行四邊形卡片展開、收合與捲動，右半部使用 SubModeMenu 顯示選項。

// 匯入 useEffect：在渲染後執行同步或事件註冊，離開時清理；useRef：保存 DOM 或跨渲染資料且不主動重新渲染；useState：建立會觸發重新渲染的狀態。
import { useEffect, useRef, useState } from "react"
// 匯入 modes：模式與子模式設定清單。
import { modes } from "./menuConfig"
// SubModeMenu：卡片右側的子模式選擇元件。
import SubModeMenu from "./SubModeMenu"
import ShortcutSettings from "./ShortcutSettings"
// 載入此元件的 CSS 樣式。
import "./MainMenu.css"

// ModeMenu：onSelectSubMode：選中可用子模式時通知 App 進入目的頁面。
function ModeMenu({ onSelectSubMode, shortcuts, onSaveShortcuts }) {
    // expandedMode：目前展開的模式 id；null 表示全部收合；setExpandedMode：切換展開模式或收合所有模式。
    const [expandedMode, setExpandedMode] = useState(null)
    // cardRefs：以模式 id 對應卡片 DOM 的 Map，用於捲動與焦點定位。
    const cardRefs = useRef(new Map())

    useEffect(() => /* 渲染後的副作用回呼：同步繪圖、事件或卡片捲動。 */ {
        if (!expandedMode) return
        // card：目前展開的卡片 DOM。
        const card = cardRefs.current.get(expandedMode)
        // 等待寬度展開完成後再捲動，小螢幕也能看見選中的完整卡片。
        // timer：等待展開完成後捲動的計時器編號，離開時清除。
        const timer = window.setTimeout(() => /* 計時器回呼：展開完成後將卡片捲入可見範圍。 */ {
            card?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "nearest", inline: "nearest" })
        }, 420)
        return () => /* 清理回呼：離開元件或依賴改變時移除事件或計時器。 */ window.clearTimeout(timer)
    }, [expandedMode])

    return (
        <main className="ModeMenu">
            <header className="MenuHeader MenuHeaderWithSettings">
                <p className="MenuEyebrow">DRAWING PRACTICE</p>
                <h1>Choose your mode</h1>
                <p>Select a mode to explore its options.</p>
                <ShortcutSettings shortcuts={shortcuts} onSave={onSaveShortcuts} />
            </header>
            <div className="ModeList" aria-label="Drawing modes" onKeyDown={event => /* 鍵盤回呼：event 為鍵盤事件，依按鍵開始遊戲或收合卡片。 */ {
                if (event.key === "Escape") {
                    cardRefs.current.get(expandedMode)?.querySelector(".ModeButton")?.focus()
                    setExpandedMode(null)
                }
            }}>
                {modes.map((mode, index) => /* mode：目前模式資料；index：從 0 開始的模式序號，用來顯示卡片編號。 */ {
                    // expanded：這張卡片是否為目前展開的模式。
                    const expanded = expandedMode === mode.id
                    return (
                        <section key={mode.id} className={`ModeCard ${expanded ? "is-expanded" : ""}`}
                            ref={element => /* DOM 參照回呼：element 或 canvas 為掛載節點，卸載時為 null。 */ {
                                if (element) cardRefs.current.set(mode.id, element)
                                else cardRefs.current.delete(mode.id)
                            }}>
                            <button className="ModeButton" aria-expanded={expanded}
                                aria-controls={`submodes-${mode.id}`}
                                onClick={() => /* 點選回呼：通知父元件切換頁面或工具，或更新展開狀態。 */ setExpandedMode(expanded ? null : mode.id)}>
                                <span className="ModeNumber">0{index + 1}</span>
                                <span className="ModeTitle">{mode.title}</span>
                                <span className="ModeToggle" aria-hidden="true">{expanded ? "-" : "+"}</span>
                            </button>
                            <SubModeMenu id={`submodes-${mode.id}`} mode={mode} expanded={expanded}
                                onSelectSubMode={onSelectSubMode} />
                        </section>
                    )
                })}
            </div>
        </main>
    )
}

export default ModeMenu
