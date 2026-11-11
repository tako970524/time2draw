// Rotate all canvas layers together.
import RotateToolIcon from "./tool icons/RotateTool.svg"

function RotateTool({ currentTool, setCurrentTool, shortcut }) {
    return (
        <button
            type="button"
            aria-label="Rotate"
            title={`旋轉工具 (${shortcut?.toUpperCase()})：按住左鍵繞螢幕中心拖曳以旋轉畫布`}
            aria-keyshortcuts={shortcut}
            aria-pressed={currentTool === "rotate"}
            className={`RotateTool ${currentTool === "rotate" ? "active" : ""}`}
            onClick={() => setCurrentTool("rotate")}
        >
            <img src={RotateToolIcon} alt="" />
        </button>
    )
}

export default RotateTool
