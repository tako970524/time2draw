//方體評分：比較缺少的可見邊與玩家筆跡，排除延伸線扣分，並以墨跡量限制亂塗得分

//scoreBox:data:RGBA像素陣列；width、height:內部尺寸；edges:缺少的答案邊；extensionLines:免扣分延伸段，回傳分數、完整度及準確度
export default function scoreBox({ data, width, height }, edges, extensionLines = []) {
    //tolerance:評分時尋找答案附近筆跡的容許距離，單位為內部像素
    const tolerance = 6
    //proximity:每個像素與答案邊的接近程度，0到1
    const proximity = new Float32Array(width * height)
    //exempt:每個像素是否位於免扣分的延伸線範圍。
    const exempt = new Uint8Array(width * height)
    //expectedLength:需要補畫的答案邊總長度，作為墨跡量上限基準
    let expectedLength = 0
    //edgeIndex:目前線段序號；a、b:線段端點；先處理答案，再處理免扣分延伸段
    for (const [edgeIndex, [a, b]] of [...edges, ...extensionLines].entries()) {
        //isExtension:目前處理的是答案邊還是免扣分的延伸線。
        const isExtension = edgeIndex >= edges.length
        //dx:線段在X方向的差值
        const dx = b.x - a.x, dy = b.y - a.y
        //length:目前線段的歐氏長度
        const length = Math.hypot(dx, dy)
        if (!isExtension) expectedLength += length
        // y：目前掃描的像素列，限制在畫布與線段附近的範圍。
        for (let y = Math.max(0, Math.floor(Math.min(a.y, b.y) - tolerance)); y <= Math.min(height - 1, Math.ceil(Math.max(a.y, b.y) + tolerance)); y++) {
            // x：目前掃描的像素欄，限制在畫布與線段附近的範圍。
            for (let x = Math.max(0, Math.floor(Math.min(a.x, b.x) - tolerance)); x <= Math.min(width - 1, Math.ceil(Math.max(a.x, b.x) + tolerance)); x++) {
                // t：線段或曲線上的位置參數，0 代表起點、1 代表終點。
                const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (length * length || 1)))
                // distance：兩點或像素到線段的距離。
                const distance = Math.hypot(x - a.x - t * dx, y - a.y - t * dy)
                if (isExtension) {
                    // 3：延伸線免扣分的距離容許值；y * width + x 是像素的一維索引。
                    if (distance <= 3) exempt[y * width + x] = 1
                } else {
                    // 距離 2 像素內給滿分，2～6 像素逐漸減分；重疊邊線保留較佳品質。
                    proximity[y * width + x] = Math.max(proximity[y * width + x], Math.max(0, 1 - Math.max(0, distance - 2) / 4))
                }
            }
        }
    }
    // ink：扣除豁免區後的總墨跡量，以像素透明度加總；matchedInk：依答案接近程度加權後的有效墨跡量。
    let ink = 0, matchedInk = 0
    // i：目前迭代序號，依迴圈用途表示像素索引、取樣步數或面頂點序號。
    for (let i = 0; i < proximity.length; i++) {
        // 延伸線不增加完整度或得分，也不消耗答案的墨跡量預算。
        if (exempt[i] && proximity[i] < 1) continue
        // alpha：玩家筆跡像素的透明度，從 0～255 換算成 0～1。
        const alpha = data[i * 4 + 3] / 255
        ink += alpha
        matchedInk += alpha * proximity[i]
    }
    // coverageByEdge：每條答案邊各自被玩家筆跡覆蓋的比例。
    const coverageByEdge = edges.map(([a, b]) => /* a、b：答案邊的 2D 端點；回傳該邊的筆跡覆蓋比例。 */ {
        // steps：取樣或繪製的步數，確保線段連續。
        const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y)))
        // 取樣邊的內部，避免輔助線只碰到角落就被判定完成整條邊。
        // inset：略過兩端點附近的取樣距離，避免只畫輔助線接到角落就算完成。
        const inset = Math.min(tolerance + 1, Math.floor(steps / 4))
        // covered：目前答案邊累積的覆蓋品質。
        let covered = 0
        // i：目前迭代序號，依迴圈用途表示像素索引、取樣步數或面頂點序號。
        for (let i = inset; i <= steps - inset; i++) {
            // x：目前計算位置的 X 座標。
            const x = a.x + (b.x - a.x) * i / steps
            // y：目前計算位置的 Y 座標。
            const y = a.y + (b.y - a.y) * i / steps
            // best：目前取樣點附近找到的最佳筆跡品質。
            let best = 0
            // oy：鄰近像素相對取樣點的 Y 偏移量。
            for (let oy = -tolerance; oy <= tolerance; oy++) {
                // ox：鄰近像素相對取樣點的 X 偏移量。
                for (let ox = -tolerance; ox <= tolerance; ox++) {
                    // px：要讀取的鄰近像素 X 座標；py：要讀取的鄰近像素 Y 座標。
                    const px = Math.round(x + ox), py = Math.round(y + oy)
                    if (px < 0 || px >= width || py < 0 || py >= height) continue
                    // quality：候選筆跡像素對目前取樣點的位置準確程度。
                    const quality = Math.max(0, 1 - Math.max(0, Math.hypot(px - x, py - y) - 2) / 4)
                    // RGBA 每像素占 4 個值，+3 讀取透明度；32 是有效筆跡的最低透明度。
                    if (data[(py * width + px) * 4 + 3] >= 32) best = Math.max(best, quality)
                }
            }
            covered += best
        }
        return covered / (steps - 2 * inset + 1)
    })
    // coverage：各答案邊完整度的平均值，0 到 1。
    const coverage = coverageByEdge.length ? coverageByEdge.reduce((sum, value) => /* 加總回呼：sum 為累計值，後一參數為目前值或頂點索引。 */ sum + value, 0) / coverageByEdge.length : 0
    // precision：有效墨跡占總墨跡的比例，0 到 1。
    const precision = ink ? matchedInk / ink : 0
    // 即使塗抹集中在答案附近，墨跡過厚或過量仍須扣分。
    // inkPenalty：墨跡過量時的扣分係數，避免畫很粗或塗滿得到高分。
    const inkPenalty = ink ? Math.min(1, expectedLength * 2.5 / ink) : 0
    // balance：完整度與準確度的調和平均，任一項低都會限制總分。
    const balance = precision + coverage ? 2 * precision * coverage / (precision + coverage) : 0
    // score：0～100 總分；coverage：完整度百分比；precision：準確度百分比，四捨五入供 UI 顯示。
    return { score: Math.round(100 * balance * inkPenalty), coverage: Math.round(coverage * 100), precision: Math.round(precision * 100) }
}
