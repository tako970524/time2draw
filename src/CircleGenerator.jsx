import { memo, useEffect, useEffectEvent, useState } from "react"
import { createCircleQuestion } from "./circleGeometry"

// 由題號 key 重新掛載；換工具、顯示答案時沿用原題。
function CircleGenerator({ round, onQuestionReady }) {
    const [question] = useState(() => createCircleQuestion(round))
    const notifyReady = useEffectEvent(() => onQuestionReady?.(question))
    useEffect(() => { notifyReady() }, [question])

    const { cx, cy, rx, ry } = question
    return (
        <svg className="CircleReference" viewBox="0 0 1000 1000" aria-hidden="true">
            <rect width="1000" height="1000" fill="white" />
            <rect x={cx - rx} y={cy - ry} width={rx * 2} height={ry * 2}
                fill="none" stroke="#303737" strokeWidth="3" />
        </svg>
    )
}

export default memo(CircleGenerator)
