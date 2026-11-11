import test from "node:test"
import assert from "node:assert/strict"
import { createCircleQuestion } from "../src/circleGeometry.js"
import scoreCircle from "../src/scoreCircle.js"

function blankImage() {
    return { width: 1000, height: 1000, data: new Uint8ClampedArray(1000 * 1000 * 4) }
}

// Rasterize a thin freehand-like stroke independently of the scoring segments.
function drawCurve(image, { cx, cy, rx, ry }, fraction = 1, thickness = 1.5) {
    const steps = Math.ceil(2 * Math.PI * Math.max(rx, ry) * 4)
    const radius = thickness / 2
    for (let i = 0; i <= steps * fraction; i++) {
        const angle = i / steps * Math.PI * 2
        const x = cx + rx * Math.cos(angle)
        const y = cy + ry * Math.sin(angle)
        for (let py = Math.floor(y - radius - 1); py <= Math.ceil(y + radius + 1); py++) {
            for (let px = Math.floor(x - radius - 1); px <= Math.ceil(x + radius + 1); px++) {
                if (px < 0 || py < 0 || px >= image.width || py >= image.height) continue
                const alpha = Math.round(255 * Math.max(0, Math.min(1, radius + 0.5 - Math.hypot(px - x, py - y))))
                const index = (py * image.width + px) * 4 + 3
                image.data[index] = Math.max(image.data[index], alpha)
            }
        }
    }
    return image
}

test("a set contains five varied squares then five non-square rectangles within the canvas", () => {
    for (const random of [() => 0, () => 0.499, () => 0.999]) {
        const questions = Array.from({ length: 10 }, (_, index) => createCircleQuestion(index + 1, random))
        assert.equal(new Set(questions.slice(0, 5).map(q => q.rx)).size, 5)
        for (const [index, q] of questions.entries()) {
            assert.equal(q.kind, index < 5 ? "circle" : "ellipse")
            assert.equal(q.rx === q.ry, index < 5)
            assert.ok(q.cx - q.rx > 0 && q.cx + q.rx < 1000)
            assert.ok(q.cy - q.ry > 0 && q.cy + q.ry < 1000)
        }
    }
})

test("blank submissions get zero", () => {
    for (const round of [1, 6]) {
        assert.deepEqual(scoreCircle(blankImage(), createCircleQuestion(round)), { score: 0, coverage: 0, precision: 0 })
    }
})

test("accurate circles and ellipses at every question size get high scores", () => {
    for (let round = 1; round <= 10; round++) {
        const q = createCircleQuestion(round, () => 0.5)
        const result = scoreCircle(drawCurve(blankImage(), q), q)
        assert.ok(result.score >= 98, `Round ${round}: ${JSON.stringify(result)}`)
    }
})

test("partial and misplaced curves lose completeness or accuracy", () => {
    const q = createCircleQuestion(3, () => 0.5)
    const half = scoreCircle(drawCurve(blankImage(), q, 0.5), q)
    const displaced = scoreCircle(drawCurve(blankImage(), { ...q, cx: q.cx + 60 }), q)
    const wrongSize = scoreCircle(drawCurve(blankImage(), { ...q, rx: q.rx * 0.7, ry: q.ry * 0.7 }), q)
    assert.ok(half.coverage >= 48 && half.coverage <= 53, JSON.stringify(half))
    assert.ok(half.score < 75)
    assert.ok(displaced.score < 25, JSON.stringify(displaced))
    assert.equal(wrongSize.score, 0)
})

test("a circle is not accepted as an ellipse inside a non-square rectangle", () => {
    const q = createCircleQuestion(10, () => 0.5)
    const result = scoreCircle(drawCurve(blankImage(), { ...q, rx: q.ry }), q)
    assert.ok(result.score < 25, JSON.stringify(result))
})

test("filling the canvas or using a very thick stroke cannot earn a high score", () => {
    const q = createCircleQuestion(4, () => 0.5)
    const filled = blankImage()
    for (let i = 3; i < filled.data.length; i += 4) filled.data[i] = 255
    const floodScore = scoreCircle(filled, q)
    const thickScore = scoreCircle(drawCurve(blankImage(), q, 1, 30), q)
    assert.ok(floodScore.score <= 1, JSON.stringify(floodScore))
    assert.ok(thickScore.score < 25, JSON.stringify(thickScore))
})
