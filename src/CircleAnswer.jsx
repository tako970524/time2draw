function CircleAnswer({ question: { cx, cy, rx, ry } }) {
    const guideExtension = 35
    return (
        <svg className="CircleReference" viewBox="0 0 1000 1000" aria-hidden="true">
            <g stroke="#448fc1" strokeWidth="2" strokeDasharray="10 8" fill="none" opacity="0.85">
                <path d={`M ${cx - rx - guideExtension} ${cy} H ${cx + rx + guideExtension}`} />
                <path d={`M ${cx} ${cy - ry - guideExtension} V ${cy + ry + guideExtension}`} />
            </g>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#008b72" strokeWidth="3" />
            <circle cx={cx} cy={cy} r="4" fill="#448fc1" />
        </svg>
    )
}

export default CircleAnswer
