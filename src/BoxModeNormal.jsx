// BoxModeNormal.jsx：Boxes Normal 每組 10 題，沿用 BoxGame 的共用出題與評分流程。
import BoxGame from "./BoxGame"

// normalRoundLimit：一組題數；之後想改成 5 題或 20 題，只需調整此值。
const normalRoundLimit = 10

// BoxModeNormal：props 接收 App 的目前工具、工具切換及退出回呼，傳給共用遊戲元件。
function BoxModeNormal(props) {
    return <BoxGame {...props} roundLimit={normalRoundLimit} modeName="Normal" />
}

export default BoxModeNormal
