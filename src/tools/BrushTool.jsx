// BrushTool.jsx：筆刷工具按鈕：通知父元件切換為 brush，實際筆跡由 Canvas.jsx 處理。

// BrushToolIcon：筆刷工具的 SVG 圖示。
import BrushToolIcon from "./tool icons/BrushTool.svg"

// BrushTool：currentTool：控制按鈕啟用樣式；setCurrentTool：點選時切換為 brush。
function BrushTool({ currentTool, setCurrentTool, shortcut }) {
    return (
        <button
            type="button"
            aria-label="Brush"
            title={`Brush Tool (${shortcut?.toUpperCase()})`}
            aria-keyshortcuts={shortcut}
            aria-pressed={currentTool === "brush"}
            className={`BrushTool ${currentTool === "brush" ? "active" : ""}`}
            onClick={() => /* 點選回呼：通知父元件切換頁面或工具，或更新展開狀態。 */ setCurrentTool("brush")}
        >
            <img src={BrushToolIcon} alt="" />
        </button>
    )
}

export default BrushTool
