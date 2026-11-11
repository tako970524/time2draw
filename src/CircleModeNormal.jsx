import PracticeGame from "./PracticeGame"
import CircleGenerator from "./CircleGenerator"
import CircleAnswer from "./CircleAnswer"
import scoreCircle from "./scoreCircle"

const circleExercise = {
    title: "Circles",
    Generator: CircleGenerator,
    AnswerOverlay: CircleAnswer,
    scoreQuestion: scoreCircle,
    instruction: round => round <= 5 ? "前半組：以正方形為參考，畫出內切圓" : "後半組：以矩形為參考，畫出內切橢圓",
    hint: "曲線需與四邊中點相切 · Ctrl+Z 復原",
    answerHint: "綠線為答案；藍色虛線為中心十字輔助線。",
}

function CircleModeNormal(props) {
    return <PracticeGame {...props} exercise={circleExercise} roundLimit={10} modeName="Normal" />
}

export default CircleModeNormal
