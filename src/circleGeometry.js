// 所有幾何使用與 Canvas 相同的 1000 × 1000 內部座標。
export function createCircleQuestion(round, random = Math.random) {
    const isCircle = round <= 5
    const index = (round - 1) % 5
    // 分散尺寸區間，確保同一組五題有明顯大小變化。
    const sizes = isCircle ? [280, 440, 600, 360, 740] : [500, 620, 740, 560, 700]
    const longSide = sizes[index] + (random() - 0.5) * 40
    const ratio = isCircle ? 1 : [1.35, 1.6, 1.95, 1.45, 2.15][index] + (random() - 0.5) * 0.1
    const horizontal = isCircle || random() >= 0.5
    const width = horizontal ? longSide : longSide / ratio
    const height = horizontal ? longSide / ratio : longSide
    const cx = 500 + (random() - 0.5) * 80
    const cy = 500 + (random() - 0.5) * 80
    return { kind: isCircle ? "circle" : "ellipse", cx, cy, rx: width / 2, ry: height / 2 }
}

export function ellipseEdges({ cx, cy, rx, ry }) {
    // 以短線段近似光滑曲線，共用原有的完整度、準確度及墨跡量評分。
    // 每段不超過約 4 像素，誤差遠低於評分容許距離。
    const steps = Math.max(128, Math.ceil(2 * Math.PI * Math.max(rx, ry) / 4))
    const points = Array.from({ length: steps }, (_, index) => {
        const angle = index * Math.PI * 2 / steps
        return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) }
    })
    return points.map((point, index) => [point, points[(index + 1) % points.length]])
}
