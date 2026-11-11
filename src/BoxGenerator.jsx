// BoxGenerator.jsx：方體產生器：建立與旋轉 3D 頂點、投影到 2D，再繪製題目、可見面及透視參考資料。

// 匯入 memo：props 不變時略過元件重新渲染；useEffect：在渲染後執行同步或事件註冊，離開時清理；useEffectEvent：讓 effect 內呼叫的函式讀取最新 props 與狀態；useRef：保存 DOM 或跨渲染資料且不主動重新渲染。
import { memo, useEffect, useEffectEvent, useRef } from "react"

// BoxGenerator：faceOnly：題目模式；showAnswer：是否顯示完整可見面答案；onQuestionReady：產生題目後回傳資料。
function BoxGenerator({ faceOnly = false, showAnswer = false, onQuestionReady }) {

    //保存canvas DOM元素參照
    // canvasRef：目前元件 canvas DOM 的參照。
    const canvasRef = useRef(null)
    // questionRef：保存目前題目的幾何與答案資料，重新渲染時沿用同一題。
    const questionRef = useRef(null)

    //Canvas內部解析度
    // canvasWidth：canvas 內部寬度，影響投影及資料座標而非 CSS 顯示寬度。
    const canvasWidth = 1000
    // canvasHeight：canvas 內部高度，影響投影及資料座標而非 CSS 顯示高度。
    const canvasHeight = 1000

    //Field of View
    // fov：攝影機視野角度，單位為度；調整可改變透視程度。
    const fov = 65

    //水平線的位置
    // horizonY：水平線在內部畫布上的 Y 位置。
    const horizonY = canvasHeight * 2 / 3

    //畫面水平中心
    // centerX：投影的水平中心位置。
    const centerX = canvasWidth / 2

    //角度->弧度
    //Math使用弧度
    // toRadians：degrees：角度；回傳以弧度表示的值供 Math 旋轉函式使用。
    function toRadians(degrees) {
        return degrees * Math.PI / 180
    }

    //產生min ~ max之間的隨機小數
    // random：min、max：隨機範圍；回傳 min 到 max 之間的小數。
    function random(min, max) {
        return Math.random() * (max - min) + min
    }

    //用Canvas寬度與FOV計算焦距
    // getFocalLength：利用畫布寬度與視野角度回傳投影焦距。
    function getFocalLength() {

        // fovRadians：將視野角度換算成 Math 函式使用的弧度。
        const fovRadians = toRadians(fov)

        //焦距公式
        return (canvasWidth / 2 / Math.tan(fovRadians / 2))
    }

    //point:旋轉座標
    //angle:旋轉角度
    // rotateX：point：3D 座標；angle：弧度；回傳繞 X 軸旋轉後的新座標。
    function rotateX(point, angle) {

        // cos：旋轉角度的餘弦值。
        const cos = Math.cos(angle)
        // sin：旋轉角度的正弦值。
        const sin = Math.sin(angle)

        return {

            x: point.x,
            y: point.y * cos - point.z * sin,
            z: point.y * sin + point.z * cos
        }
    }

    // rotateY：point：3D 座標；angle：弧度；回傳繞 Y 軸旋轉後的新座標。
    function rotateY(point, angle) {

        // cos：旋轉角度的餘弦值。
        const cos = Math.cos(angle)
        // sin：旋轉角度的正弦值。
        const sin = Math.sin(angle)

        return {

            x: point.x * cos + point.z * sin,
            y: point.y,
            z: -point.x * sin + point.z * cos
        }
    }

    //將3D座標投影成2D座標
    // project：point：含深度 z 的 3D 座標；回傳 canvas 上的 2D 投影。
    function project(point) {

        // focalLength：由視野及畫布寬度算出的投影焦距。
        const focalLength = getFocalLength()

        //screenX = centerX + f × x/z
        //screenY = horizonY - f × y/z

        return {
            x: centerX + focalLength * point.x / point.z,
            y: horizonY - focalLength * point.y / point.z
        }
    }

    //創建立方體
    // createCube：建立以原點為中心、邊長為 1 的方體八個頂點。
    function createCube() {

        //每個方向各延伸0.5
        // half：方體中心到各面的距離，0.5 對應邊長 1。
        const half = 0.5

        return [

            { x: -half, y: -half, z: -half }, // 0
            { x:  half, y: -half, z: -half }, // 1
            { x:  half, y:  half, z: -half }, // 2
            { x: -half, y:  half, z: -half }, // 3

            { x: -half, y: -half, z: half },  // 4
            { x:  half, y: -half, z: half },  // 5
            { x:  half, y:  half, z: half },  // 6
            { x: -half, y:  half, z: half }   // 7
        ]
    }

    //畫2D線
    //ctx:Canvas 2D Context
    //dashed:虛線
    // drawLine：ctx：2D 環境；start、end：2D 端點；dashed：是否使用虛線。
    function drawLine(
        ctx,
        start,
        end,
        dashed = false
    ) {

        //開始一條新的 Path
        ctx.beginPath()

        //設定線條樣式
        if (dashed) {

            //8px實線+8px空白
            ctx.setLineDash([8, 8])

        } else {

            //一般實線
            ctx.setLineDash([])
        }

        //移動到起點
        ctx.moveTo(start.x, start.y)

        //從起點建立一條到終點的線
        ctx.lineTo(end.x, end.y)

        //畫到Canvas上
        ctx.stroke()
    }


    //繪製消失點
    // drawVanishingPoint：ctx：2D 環境；point：消失點位置；name：標籤；距離畫布太遠時不畫。
    function drawVanishingPoint(
        ctx,
        point,
        name
    ) {

        //如果離Canvas太遠就不畫
        if (
            point.x < -2000 ||
            point.x > canvasWidth + 2000 ||
            point.y < -2000 ||
            point.y > canvasHeight + 2000
        ) {
            return
        }

        ctx.setLineDash([])

        ctx.beginPath()
        //畫半徑 6px 的圓
        ctx.arc(
            point.x,
            point.y,
            6,
            0,
            Math.PI * 2
        )
        ctx.fill()

        //顯示名稱
        ctx.fillText(
            name,
            point.x + 10,
            point.y - 10
        )
    }

    //計算消失點
    //direction:方向向量
    // getVanishingPoint：direction：旋轉後的 3D 軸方向；回傳消失點，近乎平行投影面時回傳 null。
    function getVanishingPoint(direction) {

        // focalLength：由視野及畫布寬度算出的投影焦距。
        const focalLength = getFocalLength()

        //direction.z 接近 0 dx / dz 會趨近無限大
        if (Math.abs(direction.z) < 0.001) {
            return null
        }


        return {
            x: centerX + focalLength * direction.x / direction.z,
            y: horizonY - focalLength * direction.y / direction.z
        }
    }

    //vertices:8個頂點
    //indexes:這個面由哪些頂點組成
    // drawFace：ctx：2D 環境；vertices：2D 頂點；indexes：面的索引；fillStyle：填色。
    function drawFace(
        ctx,
        vertices,
        indexes,
        fillStyle
    ) {

        ctx.beginPath()

        //先移動到這個面的第一個頂點
        ctx.moveTo(
            vertices[indexes[0]].x,
            vertices[indexes[0]].y
        )

        //依序將所有頂點連起來
        // i：目前迭代序號，依迴圈用途表示像素索引、取樣步數或面頂點序號。
        for (let i = 1; i < indexes.length; i++) {
            ctx.lineTo(
                vertices[indexes[i]].x,
                vertices[indexes[i]].y
            )
        }
        ctx.closePath()

        //設定面的顏色
        ctx.fillStyle = fillStyle

        //填滿整個面
        ctx.fill()
    }

    //沿用繪線及消失點函式，三組輔助線各自使用同一種顏色。
    // drawPerspectiveGuides：ctx：2D 環境；guideGroups：三組單向延伸段；vanishingPoints：三個消失點；半透明繪製並恢復 ctx 設定。
    function drawPerspectiveGuides(ctx, guideGroups, vanishingPoints) {
        // colors：X、Y、Z 三組輔助線及消失點的顏色。
        const colors = ["#dc5965", "#259b72", "#477ddd"]
        ctx.save()
        ctx.globalAlpha = 0.4
        ctx.strokeStyle = "#666"
        ctx.fillStyle = "#555"
        ctx.lineWidth = 1
        ctx.font = "16px sans-serif"
        drawLine(ctx, { x: 0, y: horizonY }, { x: canvasWidth, y: horizonY })
        guideGroups.forEach((lines, index) => /* 逐項回呼：第一參數為目前線群組、消失點或頂點索引，第二參數為序號。 */ {
            ctx.strokeStyle = colors[index]
            // start、end：目前輔助線的起點及消失點，依序繪製虛線。
            for (const [start, end] of lines) drawLine(ctx, start, end, true)
        })
        vanishingPoints.forEach((point, index) => /* 逐項回呼：第一參數為目前線群組、消失點或頂點索引，第二參數為序號。 */ {
            ctx.fillStyle = colors[index]
            if (point) drawVanishingPoint(ctx, point, ["VP-X", "VP-Y", "VP-Z"][index])
        })
        ctx.restore()
    }

    // generateBox：產生投影並繪圖；題目模式首次保存幾何，送出後重用已保存資料。
    function generateBox() {

        // canvas：目前要操作的 canvas DOM。
        const canvas = canvasRef.current

        if (!canvas) {return}

        // ctx：canvas 的 2D 繪圖環境。
        const ctx = canvas.getContext("2d")

        //清除Canvas
        ctx.clearRect(
            0,
            0,
            canvasWidth,
            canvasHeight
        )

        // rotationX：本次產生方體時繞 X 軸旋轉的弧度。
        const rotationX = toRadians(random(15, 75))
        // rotationY：本次產生方體時繞 Y 軸旋轉的弧度。
        const rotationY = toRadians(random(15, 75))
        // cubeZ：方體中心距離攝影機的 Z 值，越大投影越小。
        const cubeZ = random(3.5, 4.5)
        // focalLength：由視野及畫布寬度算出的投影焦距。
        const focalLength = getFocalLength()

        // centerWorldY：讓方體投影接近畫面垂直中央的世界 Y 座標。
        const centerWorldY = (horizonY - canvasHeight / 2) * cubeZ / focalLength

        //Cube在3D的中心位置
        // cubePosition：方體中心在 3D 世界中的平移位置。
        const cubePosition = {

            x: random(-0.25, 0.25),
            y: centerWorldY + random(-0.2, 0.2),
            z: cubeZ
        }

        // vertices：以方體中心為原點的八個原始頂點。
        const vertices = createCube()

        //旋轉頂點
        // rotatedVertices：完成 X、Y 軸旋轉但尚未平移的 3D 頂點。
        const rotatedVertices =
            vertices.map(vertex => /* 轉換回呼：逐一將目前項目或端點轉為新資料；index 為對應序號。 */ {
                // point：目前操作或計算使用的座標點；維度依所在函式而定。
                let point = rotateX(vertex, rotationX)
                point = rotateY(point, rotationY)

                return point
            })

        //移動到指定位置
        // transformedVertices：旋轉並移到指定位置後的 3D 頂點。
        const transformedVertices =
            rotatedVertices.map(point => /* 轉換回呼：逐一將目前項目或端點轉為新資料；index 為對應序號。 */ {

                return {
                    x: point.x + cubePosition.x,
                    y: point.y + cubePosition.y,
                    z: point.z + cubePosition.z
                }
            })

        //將頂點投影成2D
        //transformedVertices.map(point => {return project(point)})
        // projectedVertices：投影到 2D canvas 的八個頂點。
        const projectedVertices =
            transformedVertices.map(project)

        //Normal 模式直接使用既有的面與線條函式。
        // 題目與送出後的答案共用保存的幾何；一般完整方體模式則繼續往下繪製。
        // xDirection：隨方體旋轉的 X 軸方向向量。
        let xDirection = {
            x: 1,
            y: 0,
            z: 0
        }

        // yDirection：隨方體旋轉的 Y 軸方向向量。
        let yDirection = {
            x: 0,
            y: 1,
            z: 0
        }

        // zDirection：隨方體旋轉的 Z 軸方向向量。
        let zDirection = {
            x: 0,
            y: 0,
            z: 1
        }

        //x方向旋轉
        xDirection = rotateX(xDirection, rotationX)
        xDirection = rotateY(xDirection, rotationY)

        //y方向旋轉
        yDirection = rotateX(yDirection, rotationX)
        yDirection = rotateY(yDirection, rotationY)

        //z方向旋轉
        zDirection = rotateX(zDirection, rotationX)
        zDirection = rotateY(zDirection, rotationY)

        //計算消失點
        // vpX：X 軸方向的消失點，無有限投影時為 null。
        const vpX = getVanishingPoint(xDirection)
        // vpY：Y 軸方向的消失點，無有限投影時為 null。
        const vpY = getVanishingPoint(yDirection)
        // vpZ：Z 軸方向的消失點，無有限投影時為 null。
        const vpZ = getVanishingPoint(zDirection)

        // xEdges：與 X 軸平行的四條邊，每條存兩個頂點索引。
        const xEdges = [
            [0, 1],
            [3, 2],
            [4, 5],
            [7, 6]
        ]

        // yEdges：與 Y 軸平行的四條邊，每條存兩個頂點索引。
        const yEdges = [
            [0, 3],
            [1, 2],
            [4, 7],
            [5, 6]
        ]

        // zEdges：與 Z 軸平行的四條邊，每條存兩個頂點索引。
        const zEdges = [
            [0, 4],
            [1, 5],
            [2, 6],
            [3, 7]
        ]

        // vanishingPoints：依 X、Y、Z 順序排列的三個消失點。
        const vanishingPoints = [vpX, vpY, vpZ]
        // edgeGroups：依 X、Y、Z 順序排列的邊群組。
        const edgeGroups = [xEdges, yEdges, zEdges]
        //只從靠近消失點的邊端點向消失點畫，不穿過方體或向反方向延伸。
        // guideGroups：顯示用輔助線群組，只向對應消失點方向延伸。
        const guideGroups = edgeGroups.map((edges, index) => /* 轉換回呼：逐一將目前項目或端點轉為新資料；index 為對應序號。 */ {
            // point：目前操作或計算使用的座標點；維度依所在函式而定。
            const point = vanishingPoints[index]
            if (!point) return []
            return edges.map(([a, b]) => /* 轉換回呼：逐一將目前項目或端點轉為新資料；index 為對應序號。 */ {
                // start：線段起點的 2D 座標；end：線段終點的 2D 座標。
                const start = projectedVertices[a], end = projectedVertices[b]
                // nearest：這條邊上較靠近消失點的端點，作為延伸起點。
                const nearest = Math.hypot(start.x - point.x, start.y - point.y)
                    < Math.hypot(end.x - point.x, end.y - point.y) ? start : end
                return [nearest, point]
            })
        })

        // guideLines：每條邊所在直線與畫布邊界的交點，用於評分豁免範圍。
        const guideLines = [...xEdges, ...yEdges, ...zEdges].map(([a, b]) => /* 轉換回呼：逐一將目前項目或端點轉為新資料；index 為對應序號。 */ {
            // start：線段起點的 2D 座標；end：線段終點的 2D 座標。
            const start = projectedVertices[a], end = projectedVertices[b]
            // dx：線段在 X 方向的差值；dy：線段在 Y 方向的差值。
            const dx = end.x - start.x, dy = end.y - start.y
            // tx：延伸直線與左右畫布邊界相交的參數區間。
            const tx = dx ? [(-start.x) / dx, (canvasWidth - start.x) / dx].sort((a, b) => /* 排序回呼：a、b 為比較值；索引遞增或依深度由遠到近排列。 */ a - b) : [-Infinity, Infinity]
            // ty：延伸直線與上下畫布邊界相交的參數區間。
            const ty = dy ? [(-start.y) / dy, (canvasHeight - start.y) / dy].sort((a, b) => /* 排序回呼：a、b 為比較值；索引遞增或依深度由遠到近排列。 */ a - b) : [-Infinity, Infinity]
            // low：畫布內延伸線段的最小參數；high：畫布內延伸線段的最大參數。
            const low = Math.max(tx[0], ty[0]), high = Math.min(tx[1], ty[1])
            return [{ x: start.x + low * dx, y: start.y + low * dy },
                { x: start.x + high * dx, y: start.y + high * dy }]
        })

        if (faceOnly) {
            if (!questionRef.current) {
                // faces：方體六個面的頂點索引陣列，各面由四個頂點組成。
                const faces = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4],
                    [3, 7, 6, 2], [0, 4, 7, 3], [1, 2, 6, 5]]
                // visibleEdges：可見面的邊集合，用排序後的索引字串去除共用邊。
                const visibleEdges = new Map()
                // visibleFaces：面向攝影機的可見面及其填色資料。
                const visibleFaces = []
                // faceColors：六個面的填色；題目答案模式使用半透明顏色。
                const faceColors = ["rgba(71, 125, 221, 0.22)", "rgba(71, 125, 221, 0.22)",
                    "rgba(37, 155, 114, 0.22)", "rgba(37, 155, 114, 0.22)",
                    "rgba(220, 89, 101, 0.22)", "rgba(220, 89, 101, 0.22)"]
                // faceIndex：六個面的序號；face：該面的頂點索引；依序判斷可見性。
                for (const [faceIndex, face] of faces.entries()) {
                    // a、b、c：目前面的前三個 3D 頂點，用於計算法向量。
                    const [a, b, c] = face.map(index => /* 轉換回呼：逐一將目前項目或端點轉為新資料；index 為對應序號。 */ transformedVertices[index])
                    // u：面的第一條 3D 方向向量。
                    const u = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z }
                    // v：面的第二條 3D 方向向量。
                    const v = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z }
                    // normal：u 與 v 的外積法向量，用來判斷面是否朝向攝影機。
                    const normal = { x: u.y * v.z - u.z * v.y,
                        y: u.z * v.x - u.x * v.z, z: u.x * v.y - u.y * v.x }
                    if (normal.x * a.x + normal.y * a.y + normal.z * a.z >= 0) continue
                    visibleFaces.push({ indexes: face, color: faceColors[faceIndex] })
                    face.forEach((index, i) => /* 逐項回呼：第一參數為目前線群組、消失點或頂點索引，第二參數為序號。 */ {
                        // edge：以較小索引在前的兩端點索引，方便比較及去重。
                        const edge = [index, face[(i + 1) % face.length]].sort((a, b) => /* 排序回呼：a、b 為比較值；索引遞增或依深度由遠到近排列。 */ a - b)
                        visibleEdges.set(edge.join('-'), edge)
                    })
                }
                // face：題目提供的提示面頂點索引。
                const face = [1, 5, 6, 2]
                // faceKeys：提示面四條邊的識別字串集合。
                const faceKeys = new Set(face.map((a, i) => /* 轉換回呼：逐一將目前項目或端點轉為新資料；index 為對應序號。 */
                    [a, face[(i + 1) % face.length]].sort((a, b) => /* 排序回呼：a、b 為比較值；索引遞增或依深度由遠到近排列。 */ a - b).join('-')))
                // edges：完整方體可見邊的索引清單。
                const edges = [...visibleEdges.values()]
                // givenEdges：題目已提供的提示面邊線。
                const givenEdges = edges.filter(edge => /* 篩選回呼：保留符合提示邊或可見邊條件的項目；索引用於對應群組。 */ faceKeys.has(edge.join('-')))
                // givenKeys：已提供邊線的識別字串集合。
                const givenKeys = new Set(givenEdges.map(edge => /* 轉換回呼：逐一將目前項目或端點轉為新資料；index 為對應序號。 */ edge.join('-')))
                // extensionLines：可免扣分的邊線延伸段，與畫面顯示的單向輔助線分開保存。
                const extensionLines = [...xEdges, ...yEdges, ...zEdges].flatMap(([a, b], index) => /* 展平回呼：a、b 為邊索引，index 為序號，回傳兩側延伸段。 */ [
                    [guideLines[index][0], projectedVertices[a]],
                    [projectedVertices[b], guideLines[index][1]]
                ])
                // visibleGuideGroups：只保留可見邊的顯示用輔助線群組。
                const visibleGuideGroups = guideGroups.map((lines, index) => /* 篩選回呼：保留符合提示邊或可見邊條件的項目；索引用於對應群組。 */ lines.filter((_, edgeIndex) => /* 篩選回呼：保留符合提示邊或可見邊條件的項目；索引用於對應群組。 */
                    visibleEdges.has([...edgeGroups[index][edgeIndex]].sort((a, b) => /* 排序回呼：a、b 為比較值；索引遞增或依深度由遠到近排列。 */ a - b).join('-'))))
                questionRef.current = { vertices: projectedVertices, face, visibleFaces, edges, givenEdges,
                    guideGroups: visibleGuideGroups, extensionLines, vanishingPoints,
                    answerEdges: edges.filter(edge => /* 篩選回呼：保留符合提示邊或可見邊條件的項目；索引用於對應群組。 */ !givenKeys.has(edge.join('-')))
                        .map(([a, b]) => /* 轉換回呼：逐一將目前項目或端點轉為新資料；index 為對應序號。 */ [projectedVertices[a], projectedVertices[b]]) }
                onQuestionReady?.(questionRef.current)
            }
            // question：本題保存的資料，顯示答案時仍沿用同一組頂點。
            const question = questionRef.current
            if (showAnswer) {
                // face：目前要繪製的面，包含頂點索引與填色。
                for (const face of question.visibleFaces) {
                    drawFace(ctx, question.vertices, face.indexes, face.color)
                }
                drawPerspectiveGuides(ctx, question.guideGroups, question.vanishingPoints)
            } else {
                drawFace(ctx, question.vertices, question.face, "rgba(220, 89, 101, 0.22)")
            }
            ctx.lineWidth = 3
            // a、b：目前邊的兩個頂點索引，從 2D 頂點陣列取得端點繪製。
            for (const [a, b] of showAnswer ? question.edges : question.givenEdges) {
                // given：目前要畫的邊是否屬於題目提示，決定使用黑色或綠色。
                const given = question.givenEdges.some(([c, d]) => /* 比對回呼：c、d 為已提供邊的索引，檢查是否與 a、b 相同。 */ a === c && b === d)
                ctx.strokeStyle = given ? "black" : "#008b72"
                drawLine(ctx, question.vertices[a], question.vertices[b])
            }
            return
        }




        //面
        // faces：方體六個面的頂點索引陣列，各面由四個頂點組成。
        const faces = [
            [0, 1, 2, 3],
            [4, 7, 6, 5],
            [0, 4, 5, 1],
            [3, 2, 6, 7],
            [0, 3, 7, 4],
            [1, 5, 6, 2]
        ]

        // faceColors：六個面的填色；題目答案模式使用半透明顏色。
        const faceColors = [
            "rgba(99, 169, 202, 1)",
            "rgba(190, 190, 190, 0.9)",
            "rgba(100, 210, 119, 1)",
            "rgba(180, 180, 180, 0.9)",
            "rgba(220, 220, 220, 0.9)",
            "rgba(235, 162, 162, 1)"
        ]


        //計算每個面的深度
        // sortedFaces：依平均 Z 深度排序的面，供完整方體顯示使用。
        const sortedFaces = faces.map((face, index) => /* 轉換回呼：逐一將目前項目或端點轉為新資料；index 為對應序號。 */ {

            //計算這個面4個頂點的平均Z座標
            // averageZ：面上頂點的平均 Z 座標，越大表示越遠。
            const averageZ =
                face.reduce((sum, vertexIndex) => /* 加總回呼：sum 為累計值，後一參數為目前值或頂點索引。 */ {

                    return (
                        sum +
                        transformedVertices[vertexIndex].z
                    )

                }, 0) / face.length

            return {
                indexes: face,
                color: faceColors[index],
                depth: averageZ
            }
        })

        //Z越大離Camera越遠
        //遠的面先畫
        sortedFaces.sort((a, b) => /* 排序回呼：a、b 為比較值；索引遞增或依深度由遠到近排列。 */ {
            return b.depth - a.depth
        })


        //依照排序後的順序畫面
        // face：目前要繪製的面，包含頂點索引與填色。
        for (const face of sortedFaces) {

            drawFace(
                ctx,
                projectedVertices,
                face.indexes,
                face.color
            )
        }

        //畫消失點輔助線
        drawPerspectiveGuides(ctx, guideGroups, vanishingPoints)

        ctx.strokeStyle = "black"
        ctx.lineWidth = 3
        ctx.setLineDash([])


        // Spread Operator (...)
        // 將 X/Y/Z 三組 Edge 合併成一個陣列
        //
        // 4 + 4 + 4 = 12 條
        // allEdges：合併 X、Y、Z 群組後的十二條方體邊。
        const allEdges = [
            ...xEdges,
            ...yEdges,
            ...zEdges
        ]


        //邊
        // a、b：目前邊的兩個頂點索引，從 2D 頂點陣列取得端點繪製。
        for (const [a, b] of allEdges) {

            drawLine(
                ctx,
                projectedVertices[a],
                projectedVertices[b]
            )
        }

        ctx.fillStyle = "black"
        //弧度->角度
        ctx.fillText(
            `X: ${(
                rotationX *
                180 /
                Math.PI
            ).toFixed(1)}°`,
            20,
            30
        )

        ctx.fillText(
            `Y: ${(
                rotationY *
                180 /
                Math.PI
            ).toFixed(1)}°`,
            20,
            55
        )
    }

    //進入頁面生成方體
    // renderBox：包住 generateBox 的 Effect Event，讓 effect 能讀取最新 props。
    const renderBox = useEffectEvent(generateBox)
    useEffect(() => /* 渲染後的副作用回呼：同步繪圖、事件或卡片捲動。 */ { renderBox() }, [faceOnly, showAnswer])


    return (

        <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}

            style={{
                backgroundColor: "white",
                cursor: "pointer"
            }}
            
            onClick={faceOnly ? undefined : generateBox}
        />
    )
}

export default memo(BoxGenerator)
