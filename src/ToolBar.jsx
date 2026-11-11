// ToolBar.jsx：共用工具列：排列筆刷、游標及橡皮擦；方向與尺寸由 App.css 控制。

// BrushTool：筆刷工具按鈕。
import BrushTool from "./tools/BrushTool"
// CursorTool：游標工具按鈕。
import CursorTool from "./tools/CursorTool"
// EraserTool：橡皮擦工具按鈕。
import EraserTool from "./tools/EraserTool"
import RotateTool from "./tools/RotateTool"
import HandTool from "./tools/HandTool"
import ZoomTool from "./tools/ZoomTool"
import { useEffect, useRef } from "react"
import { defaultToolShortcuts } from "./toolShortcuts"

// ToolBar：currentTool：目前工具；setCurrentTool：父元件提供的工具切換函式。
function ToolBar({ currentTool, setCurrentTool, shortcuts = defaultToolShortcuts }) {
    const toolbarRef = useRef(null)

    useEffect(() => {
        function handleToolShortcut(event) {
            // 輸入文字、組字、修飾鍵與頁面切換期間不觸發工具切換。
            if (event.defaultPrevented || event.repeat || event.isComposing || event.keyCode === 229 ||
                event.ctrlKey || event.metaKey || event.altKey ||
                toolbarRef.current?.closest("[inert]") ||
                event.target.closest?.("input, textarea, select, [contenteditable]:not([contenteditable='false']), [role='textbox']")) return

            const tool = Object.keys(shortcuts).find(id => shortcuts[id] === event.key.toLowerCase())
            if (!tool) return
            event.preventDefault()
            setCurrentTool(tool)
        }

        window.addEventListener("keydown", handleToolShortcut)
        return () => window.removeEventListener("keydown", handleToolShortcut)
    }, [shortcuts, setCurrentTool])

    return (
        <div className="ToolBar" ref={toolbarRef}>
            <BrushTool
                shortcut={shortcuts.brush}
                currentTool={currentTool}
                setCurrentTool={setCurrentTool}
            />

            <CursorTool
                shortcut={shortcuts.cursor}
                currentTool={currentTool}
                setCurrentTool={setCurrentTool}
            />

            <EraserTool
                shortcut={shortcuts.eraser}
                currentTool={currentTool}
                setCurrentTool={setCurrentTool}
            />
            <RotateTool
                shortcut={shortcuts.rotate}
                currentTool={currentTool}
                setCurrentTool={setCurrentTool}
            />
            <HandTool
                shortcut={shortcuts.hand}
                currentTool={currentTool}
                setCurrentTool={setCurrentTool}
            />
            <ZoomTool currentTool={currentTool} setCurrentTool={setCurrentTool} />
        </div>
    )
}

export default ToolBar
