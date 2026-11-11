import HandToolIcon from "./tool icons/HandTool.svg"

function HandTool({ currentTool, setCurrentTool, shortcut }) {
    return (
        <button
            type="button"
            aria-label="手形工具"
            title={`手形工具 (${shortcut === " " ? "空白鍵" : shortcut?.toUpperCase()})：按住左鍵拖曳移動畫布`}
            aria-keyshortcuts={shortcut === " " ? "Space" : shortcut}
            aria-pressed={currentTool === "hand"}
            className={`HandTool ${currentTool === "hand" ? "active" : ""}`}
            onClick={() => setCurrentTool("hand")}
        >
            <img src={HandToolIcon} alt="" />
        </button>
    )
}

export default HandTool
