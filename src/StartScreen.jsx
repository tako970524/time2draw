import "./StartScreen.css"

// 固定種子讓粒子配置不會隨 React 重新渲染跳動；百分比座標適用各種螢幕比例。
const particles = Array.from({ length: 220 }, (_, index) => {
    const sample = salt => {
        const value = Math.sin((index + 1) * salt) * 43758.5453
        return value - Math.floor(value)
    }
    const lifetime = 8 + sample(78.233) * 16

    return {
        "--particle-x": `${sample(12.9898) * 100}%`,
        "--particle-y": `100%`,
        "--particle-size": `${5 + sample(93.989) * 2}px`,
        "--particle-opacity": 0.25 + sample(67.345) * 0.6,
        "--particle-lifetime": `${lifetime}s`,
        // 負延遲讓初次進入時就有處於不同生命階段的粒子。
        "--particle-delay": `${-sample(45.164) * lifetime}s`,
        "--particle-drift": `${(sample(24.753) - 0.5) * 3}rem`,
    }
})

function StartScreen({ onStart }) {

    return (
        <div
            className="StartScreen"
            role="button"
            tabIndex={0}
            aria-label="Touch to start"
            onClick={onStart}
            onKeyDown={event =>{
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    onStart()
                }
            }}
        >
            <div className="StartParticles" aria-hidden="true">
                {particles.map((style, index) => (
                    <span className="StartParticle" key={index} style={style} />
                ))}
            </div>

            <div className="StartContent">
                <h1 className="GameTitle">DRAWLAB</h1>
                <p className="TouchToStart">Touch to start</p>
            </div>
        </div>
    )
}

export default StartScreen
