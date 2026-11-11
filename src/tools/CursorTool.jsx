// CursorTool.jsx：游標工具按鈕：切換為 cursor，讓 Canvas 停止新增筆跡。

// CursorToolIcon：游標工具的 SVG 圖示。
import CursorToolIcon from "./tool icons/CursorTool.svg"

// CursorTool：currentTool：控制按鈕啟用樣式；setCurrentTool：點選時切換為 cursor。
function CursorTool({ currentTool, setCurrentTool, shortcut }) {
    return (
        <button
            type="button"
            aria-label="Cursor"
            title={`Cursor Tool (${shortcut?.toUpperCase()})`}
            aria-keyshortcuts={shortcut}
            aria-pressed={currentTool === "cursor"}
            className={`CursorTool ${currentTool === "cursor" ? "active" : ""}`}
            onClick={() => /* 點選回呼：通知父元件切換頁面或工具，或更新展開狀態。 */ setCurrentTool("cursor")}
        >
            <img src={CursorToolIcon} alt="" />
        </button>
    )
}

export default CursorTool
