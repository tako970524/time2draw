// Boxes 的模式設定；題目流程與 Circles 共用 PracticeGame。
import PracticeGame from "./PracticeGame"
import BoxGenerator from "./BoxGenerator"
import scoreBox from "./scoreBox"

function BoxQuestion(props) {
    return <BoxGenerator {...props} faceOnly />
}

const boxExercise = {
    title: "Boxes",
    Generator: BoxQuestion,
    scoreQuestion: (image, question) => scoreBox(image, question.answerEdges, question.extensionLines),
    instruction: () => "補上方體可見面的邊",
    hint: "延伸線不扣分 · Ctrl+Z 復原",
    answerHint: "綠線為答案；彩色虛線為透視輔助線。",
}

function BoxGame(props) {
    return <PracticeGame {...props} exercise={boxExercise} />
}

export default BoxGame
