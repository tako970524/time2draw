// Canvas.jsx：共用繪圖元件：處理指標座標、平滑筆跡、橡皮擦、復原與游標；內部解析度維持 1000 × 1000。

// 匯入 useEffect：在渲染後執行同步或事件註冊，離開時清理；useRef：保存 DOM 或跨渲染資料且不主動重新渲染。
import { useEffect, useRef, useState } from "react"

const MIN_ZOOM = 0.25
const MAX_ZOOM = 4

// Keep the canvas center inside the drawing area, leaving a reachable region at every edge.
function constrainPan(container, position) {
    if (!container) return position
    const viewport = container.closest(".DrawingViewport")
    if (!viewport) return position
    const bounds = viewport.getBoundingClientRect()
    const rect = container.getBoundingClientRect()
    const style = window.getComputedStyle(viewport)
    const left = Math.max(0, bounds.left) + parseFloat(style.paddingLeft || 0)
    const right = Math.min(window.innerWidth, bounds.right) - parseFloat(style.paddingRight || 0)
    const top = Math.max(0, bounds.top) + parseFloat(style.paddingTop || 0)
    const bottom = Math.min(window.innerHeight, bounds.bottom) - parseFloat(style.paddingBottom || 0)
    const marginX = Math.min(48, Math.max(0, (right - left) / 2))
    const marginY = Math.min(48, Math.max(0, (bottom - top) / 2))
    return {
        x: Math.min(Math.max(rect.left + rect.width / 2 + position.x, left + marginX), right - marginX) - (rect.left + rect.width / 2),
        y: Math.min(Math.max(rect.top + rect.height / 2 + position.y, top + marginY), bottom - marginY) - (rect.top + rect.height / 2)
    }
}

// Canvas：currentTool：目前工具；children：背景內容；drawingCanvasRef：提供外部讀取筆跡；disabled：停用繪圖與復原。
function Canvas({ currentTool, children, overlay, drawingCanvasRef, disabled = false }) {

    // 保存<canvas>DOM元素的參照
    // canvasRef：目前元件 canvas DOM 的參照。
    const canvasRef = useRef(null)
    const drawingRef = useRef(false)
    const cursorRef = useRef(null)
    const containerRef = useRef(null)
    const [rotation, setRotation] = useState(0)
    const rotationRef = useRef(0)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const panRef = useRef({ x: 0, y: 0 })
    const handDragRef = useRef(null)
    const [isPanning, setIsPanning] = useState(false)
    const [angleInput, setAngleInput] = useState(null)
    const rotatePointerRef = useRef(null)
    const [zoom, setZoom] = useState(1)
    const zoomRef = useRef(1)
    const zoomDragRef = useRef(null)

    function applyZoom(value) {
        if (!Number.isFinite(value)) return
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
        zoomRef.current = next
        setZoom(next)
        if (cursorRef.current) cursorRef.current.style.display = "none"
    }

    useEffect(() => {
        const viewport = containerRef.current?.closest(".DrawingViewport")
        if (!viewport) return
        function handleWheel(event) {
            if (!event.altKey || event.ctrlKey || event.metaKey || viewport.closest("[inert]") ||
                event.target.closest?.("input, button, .RotationControls")) return
            event.preventDefault()
            if (drawingRef.current || handDragRef.current || zoomDragRef.current || rotatePointerRef.current) return
            const units = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1
            const delta = Math.max(-200, Math.min(200, event.deltaY * units))
            applyZoom(zoomRef.current * Math.exp(-delta * 0.002))
        }
        viewport.addEventListener("wheel", handleWheel, { passive: false })
        return () => viewport.removeEventListener("wheel", handleWheel)
    }, [])

    useEffect(() => {
        const container = containerRef.current
        const viewport = container?.closest(".DrawingViewport")
        if (!viewport) return
        const observer = new ResizeObserver(() => {
            const position = constrainPan(container, panRef.current)
            if (position.x !== panRef.current.x || position.y !== panRef.current.y) {
                panRef.current = position
                setPan(position)
            }
        })
        observer.observe(viewport)
        return () => observer.disconnect()
    }, [])

    function applyRotation(angle) {
        if (!Number.isFinite(angle)) return
        const normalized = ((angle % 360) + 360) % 360
        rotationRef.current = normalized
        setRotation(normalized)
    }

    function commitAngle() {
        if (angleInput !== null && angleInput.trim() !== "") {
            applyRotation(Number(angleInput))
        }
        setAngleInput(null)
    }

    useEffect(() => {
        if (currentTool !== "rotate") return
        let previousAngle = null
        function rotateAroundScreenCenter(event) {
            if (rotatePointerRef.current !== event.pointerId || !(event.buttons & 1) ||
                containerRef.current?.closest("[inert]")) {
                previousAngle = null
                return
            }
            const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
            const dx = event.clientX - center.x
            const dy = event.clientY - center.y
            if (Math.hypot(dx, dy) < 10) {
                previousAngle = null
                return
            }
            const angle = Math.atan2(dy, dx)
            if (previousAngle !== null) {
                const delta = Math.atan2(Math.sin(angle - previousAngle), Math.cos(angle - previousAngle))
                const rect = containerRef.current.getBoundingClientRect()
                const x = rect.left + rect.width / 2 + panRef.current.x - center.x
                const y = rect.top + rect.height / 2 + panRef.current.y - center.y
                // Move the canvas center around the screen pivot along with its orientation.
                const position = {
                    x: center.x + x * Math.cos(delta) - y * Math.sin(delta) - (rect.left + rect.width / 2),
                    y: center.y + x * Math.sin(delta) + y * Math.cos(delta) - (rect.top + rect.height / 2)
                }
                const constrained = constrainPan(containerRef.current, position)
                panRef.current = constrained
                setPan(constrained)
                applyRotation(rotationRef.current + delta * 180 / Math.PI)
            }
            previousAngle = angle
        }
        function clearAnchor() {
            previousAngle = null
            rotatePointerRef.current = null
        }
        function startRotation(event) {
            if (event.isPrimary && event.button === 0 &&
                event.target.closest?.(".DrawingViewport") === containerRef.current?.closest(".DrawingViewport") &&
                !event.target.closest?.("button, input, .RotationControls")) {
                rotatePointerRef.current = event.pointerId
                rotateAroundScreenCenter(event)
            }
        }
        window.addEventListener("pointerdown", startRotation)
        window.addEventListener("pointermove", rotateAroundScreenCenter)
        window.addEventListener("pointerup", clearAnchor)
        window.addEventListener("pointercancel", clearAnchor)
        window.addEventListener("blur", clearAnchor)
        document.documentElement.addEventListener("pointerleave", clearAnchor)
        return () => {
            window.removeEventListener("pointermove", rotateAroundScreenCenter)
            window.removeEventListener("pointerdown", startRotation)
            window.removeEventListener("pointerup", clearAnchor)
            window.removeEventListener("pointercancel", clearAnchor)
            window.removeEventListener("blur", clearAnchor)
            document.documentElement.removeEventListener("pointerleave", clearAnchor)
        }
    }, [currentTool])

    // drawingRef：是否正處於一筆繪圖的指標拖曳期間。

    //前一個取樣點
    // previousPointRef：上一個曲線取樣前的座標。
    const previousPointRef = useRef(null)

    //最近一次的取樣點
    // lastPointRef：最近一次取得的指標座標。
    const lastPointRef = useRef(null)

    //Canvas歷史紀錄
    // historyRef：復原歷史，保存每筆開始前的完整像素快照。
    const historyRef = useRef([])

    //Redo歷史紀錄
    // redoRef：重做歷史，保存被復原的像素快照。
    const redoRef = useRef([])

    // cursorRef：自訂繪圖游標 DOM 的參照。

    // brushSize：筆刷直徑，單位為 canvas 內部座標像素。
    const brushSize = 1.5
    // eraserSize：橡皮擦直徑，單位為 canvas 內部座標像素。
    const eraserSize = 20

    //間距=brushSize*brushSpacing
    // brushSpacing：連續筆觸的間距比例，越小越密集但繪製成本越高。
    const brushSpacing = 0.1

    //轉換Canvas內部座標
    // getPointerPosition：event：指標事件；將螢幕座標換算成 canvas 內部座標並回傳 { x, y }。
    function getPointerPosition(event) {

        //取得CanvasDOM
        // canvas：目前要操作的 canvas DOM。
        const canvas = canvasRef.current

        //取得Canvas在瀏覽器中的實際位置與顯示尺寸
        // rect：canvas 在螢幕上的位置與顯示尺寸。
        const rect = containerRef.current.getBoundingClientRect()
        const dx = event.clientX - (rect.left + rect.width / 2) - panRef.current.x
        const dy = event.clientY - (rect.top + rect.height / 2) - panRef.current.y
        // Keep drawing coordinates aligned with the rotated view.
        const angle = rotationRef.current * Math.PI / 180
        return {
            x: (dx * Math.cos(angle) + dy * Math.sin(angle)) * canvas.width / (rect.width * zoomRef.current) + canvas.width / 2,
            y: (-dx * Math.sin(angle) + dy * Math.cos(angle)) * canvas.height / (rect.height * zoomRef.current) + canvas.height / 2
        }
    }

    //每一筆Stroke開始之前呼叫一次
    // saveHistory：儲存目前像素快照，每筆繪圖開始前呼叫。
    function saveHistory() {

        // canvas：目前要操作的 canvas DOM。
        const canvas = canvasRef.current

        //取得Canvas 2D繪圖環境
        // ctx：canvas 的 2D 繪圖環境。
        const ctx = canvas.getContext("2d")

        //讀取目前整張Canvas的像素資料
        // imageData：要放入歷史紀錄的完整畫布像素快照。
        const imageData = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        )

        //把目前畫面加入history stack
        historyRef.current.push(imageData)
    }

    // undo：將目前快照放入 redoRef，再取回 historyRef 的上一張快照。
    function undo() {

        if (historyRef.current.length === 0) {
            return
        }

        // canvas：目前要操作的 canvas DOM。
        const canvas = canvasRef.current
        // ctx：canvas 的 2D 繪圖環境。
        const ctx = canvas.getContext("2d")

        //先保存目前畫面
        // currentImage：操作前的像素快照，用於復原或重做另一方向的紀錄。
        const currentImage = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        )

        //目前畫面加入 Redo
        redoRef.current.push(currentImage)


        //取得上一個歷史狀態
        // previousImage：從復原歷史取出的上一張快照。
        const previousImage =
            historyRef.current.pop()


        //恢復上一個畫面
        ctx.putImageData(
            previousImage,
            0,
            0
        )
    }


    // redo：將目前快照放入 historyRef，再取回 redoRef 的下一張快照。
    function redo() {

        if (redoRef.current.length === 0) {
            return
        }

        // canvas：目前要操作的 canvas DOM。
        const canvas = canvasRef.current
        // ctx：canvas 的 2D 繪圖環境。
        const ctx = canvas.getContext("2d")

        //先保存目前畫面
        // currentImage：操作前的像素快照，用於復原或重做另一方向的紀錄。
        const currentImage = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        )

        //目前畫面重新加入 Undo History
        historyRef.current.push(currentImage)


        //取得下一個畫面
        // nextImage：從重做歷史取出的下一張快照。
        const nextImage =
            redoRef.current.pop()


        //恢復下一個畫面
        ctx.putImageData(
            nextImage,
            0,
            0
        )
    }


    useEffect(() => /* 渲染後的副作用回呼：同步繪圖、事件或卡片捲動。 */ {

        // handleKeyDown：event：鍵盤事件；處理 Ctrl+Z 與 Ctrl+Shift+Z，disabled 時略過。
        function handleKeyDown(event) {
            if (disabled) return

            //Ctrl + Shift + Z
            if (
                event.ctrlKey &&
                event.shiftKey &&
                event.key.toLowerCase() === "z"
            ) {
                event.preventDefault()

                redo()

                return
            }


            //Ctrl + Z
            if (
                event.ctrlKey &&
                !event.shiftKey &&
                event.key.toLowerCase() === "z"
            ) {
                event.preventDefault()

                undo()
            }
        }


        window.addEventListener(
            "keydown",
            handleKeyDown
        )


        return () => /* 清理回呼：離開元件或依賴改變時移除事件或計時器。 */ {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            )
        }

    }, [disabled])


    // drawDab：x、y：筆觸中心的內部座標；依工具填入或擦除圓形筆觸。
    function drawDab(x, y) {

        // canvas：目前要操作的 canvas DOM。
        const canvas = canvasRef.current
        // ctx：canvas 的 2D 繪圖環境。
        const ctx = canvas.getContext("2d")

        ctx.beginPath()

        //依照目前工具決定大小
        // size：依目前工具選擇的筆觸直徑。
        const size =
            currentTool === "eraser"
                ? eraserSize
                : brushSize

        ctx.arc(
            x,
            y,
            size / 2,
            0,
            Math.PI * 2
        )


        if (currentTool === "eraser") {

            //刪除 Canvas 像素
            ctx.globalCompositeOperation =
                "destination-out"

        } else {

            //繪圖
            ctx.globalCompositeOperation =
                "source-over"

            ctx.fillStyle = "black"
        }


        ctx.fill()


        //恢復成正常繪圖模式
        ctx.globalCompositeOperation =
            "source-over"
    }


    //平滑曲線

    //p0 = 更前面的點
    //p1 = 上一個點
    //p2 = 現在最新的點
    //計算二次貝茲曲線
    // drawCurve：p0、p1、p2：連續三個取樣點；用二次貝茲曲線補上連續筆觸。
    function drawCurve(p0, p1, p2) {

        //p0 和 p1 的中點
        // mid1：前兩個取樣點的中點，作為曲線起點。
        const mid1 = {
            x: (p0.x + p1.x) / 2,
            y: (p0.y + p1.y) / 2
        }

        //p1 和 p2 的中點
        // mid2：後兩個取樣點的中點，作為曲線終點。
        const mid2 = {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2
        }


        //計算 mid1 mid2 的直線距離
        //sqrt(x² + y²)
        // distance：兩點或像素到線段的距離。
        const distance = Math.hypot(
            mid2.x - mid1.x,
            mid2.y - mid1.y
        )
        //計算每個 Dab 之間應該間隔多少距離
        // size：依目前工具選擇的筆觸直徑。
        const size =
            currentTool === "eraser"
                ? eraserSize
                : brushSize

        // spacing：相鄰筆觸的距離，由直徑乘上 brushSpacing 得到。
        const spacing =
            size * brushSpacing
        //根據曲線長度決定需要多少個 Dab
        //無條件進位
        // steps：取樣或繪製的步數，確保線段連續。
        const steps = Math.max(
            1,
            Math.ceil(distance / spacing)
        )


        //沿著曲線生成Dab
        // i：目前迭代序號，依迴圈用途表示像素索引、取樣步數或面頂點序號。
        for (let i = 1; i <= steps; i++) {
            //將目前 step 轉換成 0 ~ 1
            //i = 5
            //steps = 10
            //t = 0.5
            // t：線段或曲線上的位置參數，0 代表起點、1 代表終點。
            const t = i / steps

            //1 - t
            //方便計算Bézier
            // mt：1 - t，計算二次貝茲曲線時的補數。
            const mt = 1 - t


            //二次貝茲曲線X座標
            // x：目前計算位置的 X 座標。
            const x =
                mt * mt * mid1.x +
                2 * mt * t * p1.x +
                t * t * mid2.x


            //二次貝茲曲線Y座標
            // y：目前計算位置的 Y 座標。
            const y =
                mt * mt * mid1.y +
                2 * mt * t * p1.y +
                t * t * mid2.y

            drawDab(x, y)
        }
    }

    // startDrawing：event：按下事件；儲存歷史、初始化取樣點並捕捉指標。
    function startDrawing(event) {
        if (event.button !== 0 || drawingRef.current || handDragRef.current || zoomDragRef.current) return
        if (currentTool === "zoom") {
            zoomDragRef.current = { pointerId: event.pointerId, y: event.clientY, zoom: zoomRef.current }
            event.currentTarget.setPointerCapture(event.pointerId)
            return
        }
        if (currentTool === "rotate") {
            event.currentTarget.setPointerCapture(event.pointerId)
            return
        }
        if (currentTool === "hand") {
            handDragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, pan: panRef.current }
            setIsPanning(true)
            event.currentTarget.setPointerCapture(event.pointerId)
            return
        }

        // isDrawingTool：目前工具是否為可以改動畫布像素的筆刷或橡皮擦。
        const isDrawingTool =
            currentTool === "brush" ||
            currentTool === "eraser"

        if (disabled || !isDrawingTool) {
            return
        }

        //開始新的一筆之前保存目前 Canvas
        saveHistory()

        //舊的Redo歷史失效
        redoRef.current = []

        //取得Pointer在Canvas裡的位置
        // point：目前操作或計算使用的座標點；維度依所在函式而定。
        const point =
            getPointerPosition(event)


        //標記為正在畫
        drawingRef.current = true


        //因為現在是這一筆的第一個點
        //所以 previous 和 last
        //都先設定成同一個 point
        previousPointRef.current = point
        lastPointRef.current = point


        //在第一個接觸位置先畫一個 Dab
        drawDab(
            point.x,
            point.y
        )


        //捕捉這個 Pointer
        event.currentTarget.setPointerCapture(
            event.pointerId
        )
    }

    //Pointer 移動時執行
    // draw：event：移動事件；繪製曲線並更新上一個及最近取樣點。
    function draw(event) {
        const zoomDrag = zoomDragRef.current
        if (zoomDrag?.pointerId === event.pointerId) {
            if (currentTool === "zoom") {
                applyZoom(zoomDrag.zoom * Math.exp(Math.max(-10, Math.min(10, (zoomDrag.y - event.clientY) * 0.006))))
            }
            return
        }
        const handDrag = handDragRef.current
        if (handDrag?.pointerId === event.pointerId) {
            if (currentTool === "hand") {
                const position = constrainPan(containerRef.current, {
                    x: handDrag.pan.x + event.clientX - handDrag.x,
                    y: handDrag.pan.y + event.clientY - handDrag.y
                })
                panRef.current = position
                setPan(position)
            }
            return
        }

        if (!drawingRef.current) return

        // isDrawingTool：目前工具是否為可以改動畫布像素的筆刷或橡皮擦。
        const isDrawingTool =
            currentTool === "brush" ||
            currentTool === "eraser"

        if (disabled || !isDrawingTool) {
            return
        }


        //取得目前最新 Pointer 位置
        // point：目前操作或計算使用的座標點；維度依所在函式而定。
        const point =
            getPointerPosition(event)

        //三個點建立平滑曲線
        drawCurve(
            previousPointRef.current,
            lastPointRef.current,
            point
        )


        // 更新三點資料
        //
        // 原本：
        //
        // previous → last → point
        //
        // 更新後：
        //
        //            previous → last
        //
        previousPointRef.current =
            lastPointRef.current

        lastPointRef.current = point
    }

    // Pointer 放開或被取消時
    // 結束目前這一筆 Stroke
    // stopDrawing：event：放開或取消事件；補完筆觸尾端並釋放指標捕捉。
    function stopDrawing(event) {
        if (zoomDragRef.current && zoomDragRef.current.pointerId !== event.pointerId) return
        zoomDragRef.current = null
        if (handDragRef.current && handDragRef.current.pointerId !== event.pointerId) return
        handDragRef.current = null
        setIsPanning(false)

        // 標記目前已經沒有在畫
        if (drawingRef.current && lastPointRef.current && !disabled && (currentTool === "brush" || currentTool === "eraser")) {
            drawCurve(previousPointRef.current, lastPointRef.current, lastPointRef.current)
        }
        drawingRef.current = false


        // 清除上一筆留下來的座標
        previousPointRef.current = null
        lastPointRef.current = null


        // 確認 Canvas 是否仍然捕捉這個 Pointer
        if (
            event.currentTarget.hasPointerCapture(
                event.pointerId
            )
        ) {

            // 解除 Pointer Capture
            event.currentTarget.releasePointerCapture(
                event.pointerId
            )
        }
    }

    // updateCursor：event：指標事件；移動自訂游標並依顯示縮放調整橡皮擦圓圈。
    function updateCursor(event) {

        if (
            currentTool !== "brush" &&
            currentTool !== "eraser"
        ) {
            return
        }

        // cursor：要移動或縮放的自訂游標 DOM。
        const cursor = cursorRef.current

        if (!cursor) return

        cursor.style.display = "block"

        cursor.style.left = `${event.clientX}px`
        cursor.style.top = `${event.clientY}px`
        if (currentTool === "eraser") {
            // scale：canvas 顯示寬度對內部寬度的比例，用來同步橡皮擦游標。
            const scale = containerRef.current.getBoundingClientRect().width * zoomRef.current / canvasRef.current.width
            cursor.style.width = `${eraserSize * scale}px`
            cursor.style.height = `${eraserSize * scale}px`
        }
    }

    // currentSize：目前工具的內部座標直徑。
    const currentSize =
        currentTool === "eraser"
            ? eraserSize
            : brushSize

    // showCircle：直徑大於 5 時以圓形游標顯示。
    const showCircle =
        currentSize > 5

    // showDrawingCursor：只有筆刷與橡皮擦顯示自訂繪圖游標。
    const showDrawingCursor =
        currentTool === "brush" ||
        currentTool === "eraser"

    return (
        <>
        <div className="RotationControls" role="group" aria-label="畫布旋轉">
            <button type="button" onClick={() => {
                applyRotation(0)
                setAngleInput(null)
            }}>回正</button>
            <label>
                旋轉角度
                <input
                    type="text"
                    inputMode="decimal"
                    aria-label="旋轉角度（度）"
                    value={angleInput ?? String(Math.floor(rotation))}
                    onChange={event => {
                        const value = event.target.value
                        setAngleInput(value)
                        if (value.trim() !== "") applyRotation(Number(value))
                    }}
                    onBlur={commitAngle}
                    onKeyDown={event => {
                        event.stopPropagation()
                        if (event.key === "Enter") {
                            commitAngle()
                            event.currentTarget.blur()
                        }
                        if (event.key === "Escape") {
                            setAngleInput(null)
                            event.currentTarget.blur()
                        }
                    }}
                />
                <span>°</span>
            </label>
            <output className="ZoomValue" aria-label="畫布縮放比例">{Math.round(zoom * 100)}%</output>
        </div>
        <div className="CanvasContainer" ref={containerRef}>
            <div className="CanvasLayers" style={{ transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})` }}>

            {/* children：放在筆跡下方的參考圖層，例如題目或答案。 */}
            {children}

            {/* 筆跡圖層：width／height 為內部解析度，顯示尺寸由 CSS 控制。 */}
            <canvas
                ref={(canvas) => /* DOM 參照回呼：element 或 canvas 為掛載節點，卸載時為 null。 */ {
                    canvasRef.current = canvas
                    if (drawingCanvasRef) drawingCanvasRef.current = canvas
                }}
                className="Canvas"

                style={{
                    cursor: showDrawingCursor
                        ? "none"
                        : currentTool === "hand" ? (isPanning ? "grabbing" : "grab")
                        : currentTool === "zoom" ? "ns-resize"
                        : currentTool === "rotate" ? "crosshair" : "default"
                }}

                width={1000}
                height={1000}

                onPointerDown={startDrawing}

                onPointerMove={(event) => /* 指標移動回呼：event 為移動事件，同步游標並繪圖。 */ {
                    updateCursor(event)
                    draw(event)
                }}

                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                onLostPointerCapture={stopDrawing}

                onPointerEnter={updateCursor}

                onPointerLeave={() => /* 指標離開回呼：隱藏自訂游標。 */ {
                    if (cursorRef.current) {
                        cursorRef.current.style.display = "none"
                    }
                }}
            />

            {/* 答案疊在筆跡上方，與參考圖及筆跡共用旋轉、平移與縮放。 */}
            {overlay && <div className="CanvasOverlay" aria-hidden="true">{overlay}</div>}
            </div>

            {showDrawingCursor && !disabled && (
                <div
                    ref={cursorRef}

                    className={
                        showCircle
                            ? "DrawingCursor circle"
                            : "DrawingCursor cross"
                    }

                    style={
                        showCircle
                            ? {
                                width: `${currentSize}px`,
                                height: `${currentSize}px`
                            }
                            : undefined
                    }
                />
            )}

        </div>
        </>
    )
}

export default Canvas
