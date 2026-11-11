// EraserTool.jsx：橡皮擦工具按鈕：切換為 eraser，Canvas 只擦除玩家筆跡，不影響題目圖層。

// EraserToolIcon：橡皮擦工具的 SVG 圖示。
import EraserToolIcon from "./tool icons/EraserTool.svg"

// EraserTool：currentTool：控制按鈕啟用樣式；setCurrentTool：點選時切換為 eraser。
function EraserTool({currentTool, setCurrentTool, shortcut}){
    return (
        <button
            type="button"
            aria-label="Eraser"
            title={`Eraser Tool (${shortcut?.toUpperCase()})`}
            aria-keyshortcuts={shortcut}
            aria-pressed={currentTool === "eraser"}
            className={`EraserTool ${currentTool === "eraser" ? "active" : ""}`}
            onClick={() => /* 點選回呼：通知父元件切換頁面或工具，或更新展開狀態。 */ setCurrentTool("eraser")}
        >
            <img src={EraserToolIcon} alt="" />
        </button>
    )
}

export default EraserTool
