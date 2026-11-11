import scoreBox from "./scoreBox.js"
import { ellipseEdges } from "./circleGeometry.js"

// 只讀取玩家筆跡；參考矩形、正確答案與十字線均不進入評分。
export default function scoreCircle(image, question) {
    return scoreBox(image, ellipseEdges(question))
}
