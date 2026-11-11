// BoxModeInfinity.jsx：原本的無限答題模式，不限制題數，也不在第 10 題進入結算。
import BoxGame from "./BoxGame"

// BoxModeInfinity：props 為共用工具狀態及退出回呼；roundLimit=null 保留持續出題流程。
function BoxModeInfinity(props) {
    return <BoxGame {...props} roundLimit={null} modeName="Infinity" />
}

export default BoxModeInfinity
