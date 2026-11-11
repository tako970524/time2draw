import ZoomToolIcon from "./tool icons/ZoomTool.svg"

function ZoomTool({ currentTool, setCurrentTool }) {
    return (
        <button
            type="button"
            aria-label="縮放工具"
            title="縮放工具：Alt＋滾輪，或按住左鍵向上拖曳放大、向下拖曳縮小（25%～400%）"
            aria-pressed={currentTool === "zoom"}
            className={`ZoomTool ${currentTool === "zoom" ? "active" : ""}`}
            onClick={() => setCurrentTool("zoom")}
        >
            <img src={ZoomToolIcon} alt="" />
        </button>
    )
}

export default ZoomTool
