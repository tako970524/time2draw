// PracticeGame.jsx：Boxes 與 Circles 共用的答題、工具、進度與結算流程。

// 匯入 useRef：保存 DOM 或跨渲染資料且不主動重新渲染；useState：建立會觸發重新渲染的狀態。
import { useRef, useState } from "react"
// Canvas：共用繪圖畫布元件。
import Canvas from "./Canvas"
// ToolBar：共用工具列元件。
import ToolBar from "./ToolBar"
// RoundSummary：獨立的結算畫面，之後可單獨調整版面與動畫。
import RoundSummary from "./RoundSummary"
// PageTransition：沿用通用動畫，處理答題與結算頁的切換。
import PageTransition from "./PageTransition"
// 載入此元件的 CSS 樣式。
import "./BoxMode.css"

// exercise 提供題目、評分與文案；roundLimit 為每組題數，null 表示無限。
function PracticeGame({ currentTool, setCurrentTool, shortcuts, onBack, exercise, roundLimit = null, modeName = "Infinity" }) {
    const { title, Generator, AnswerOverlay, scoreQuestion, instruction, hint, answerHint } = exercise
    // drawingCanvasRef：玩家筆跡 canvas 的參照，送出時用來讀取最終像素。
    const drawingCanvasRef = useRef(null)
    // questionRef：保存目前題目的幾何與答案資料，重新渲染時沿用同一題。
    const questionRef = useRef(null)
    // round：目前題號，也用作 Canvas 的 key 以在下一題重建畫布；setRound：更新題號，觸發下一題的畫布重建。
    const [round, setRound] = useState(1)
    // ready：題目是否已完成產生；未就緒時停用送出；setReady：更新題目就緒狀態。
    const [ready, setReady] = useState(false)
    // result：本題評分結果；null 表示尚未送出；setResult：保存評分或清空結果以開始下一題。
    const [result, setResult] = useState(null)
    // results／setResults：依答題順序保存本組成績，僅在送出成功時加入一筆。
    const [results, setResults] = useState([])
    // finished／setFinished：是否已從最後一題的答案進入結算頁。
    const [finished, setFinished] = useState(false)
    // attempt／setAttempt：重試次數，與題號共同組成 key，避免重試仍沿用第一題畫布。
    const [attempt, setAttempt] = useState(0)
    // submittedRef：同步阻擋重複送出，避免快速點擊造成成績重複計入。
    const submittedRef = useRef(false)
    // isLastRound：有限題數模式是否已到最後一題；Infinity 永遠為 false。
    const isLastRound = roundLimit !== null && round >= roundLimit

    // submit：讀取玩家最終筆跡，交由所選練習的評分函式計分。
    function submit() {
        if (!ready || submittedRef.current || !drawingCanvasRef.current || !questionRef.current) return
        // canvas：目前要操作的 canvas DOM。
        const canvas = drawingCanvasRef.current
        // scoredResult：本題成績，沿用既有評分函式，同時提供單題結果與整組結算。
        const scoredResult = scoreQuestion(canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height), questionRef.current)
        submittedRef.current = true
        setResult({ ...scoredResult, question: questionRef.current })
        setResults(previous => /* previous：此前題目的成績，新增本題而不改動原陣列。 */ [...previous, scoredResult])
    }

    // nextQuestion：清除目前題目與結果，增加題號以重建畫布及產生新題。
    function nextQuestion() {
        if (!result || !submittedRef.current) return
        // 消耗這次送出的操作資格，防止快速連點跳過題目或重複開啟結算。
        submittedRef.current = false
        // 最後一題仍先顯示答案，玩家按「查看結算」才離開畫布。
        if (isLastRound) {
            setFinished(true)
            return
        }
        questionRef.current = null
        submittedRef.current = false
        setReady(false)
        setResult(null)
        setRound(value => /* 狀態更新回呼：value 為上一個題號，回傳下一題題號。 */ value + 1)
    }

    // retry：開始全新的一組題目，清空成績、筆跡與舊題目，重設成筆刷工具。
    function retry() {
        questionRef.current = null
        submittedRef.current = false
        setReady(false)
        setResult(null)
        setResults([])
        setRound(1)
        setAttempt(value => /* value：上一次重試編號，增加後讓畫布重建。 */ value + 1)
        setCurrentTool("brush")
        setFinished(false)
    }

    return (
        <PageTransition pageKey={finished ? "summary" : `practice-${attempt}`} initialPage="practice-0">
        {finished ? (
            <RoundSummary results={results} modeName={`${title} / ${modeName}`} onRetry={retry} onExit={onBack} />
        ) : (
        <div className="BoxModeNormal BoxGame">
            <ToolBar
                currentTool={currentTool}
                setCurrentTool={setCurrentTool}
                shortcuts={shortcuts}
            />

            <div className="BoxModeWorkspace">
                <header className="BoxGameHeader">
                    <div className="BoxGameHeading">
                        {onBack && <button className="BoxExitButton" onClick={onBack}>退出</button>}
                        <div><p className="BoxModeLabel">{title.toUpperCase()} / {modeName.toUpperCase()}</p>
                            <h1>第 {round} 題 {roundLimit && <small>/ {roundLimit}</small>}</h1>
                        </div>
                    </div>
                    <div className="BoxSessionProgress">
                        <span>{roundLimit ? `已完成 ${results.length} / ${roundLimit} 題` : `已完成 ${results.length} 題 · 無限練習`}</span>
                        {roundLimit && <progress value={results.length} max={roundLimit} aria-label="本組完成進度" />}
                    </div>
                </header>
                <div className="DrawingViewport">
                {/* 題號 key 改變時重新掛載 Canvas，清空筆跡、歷史及舊題目。 */}
                <Canvas key={`${attempt}-${round}`} currentTool={currentTool} drawingCanvasRef={drawingCanvasRef} disabled={!!result}
                    overlay={result && AnswerOverlay ? <AnswerOverlay question={result.question} /> : null}>
                    <div className="BoxModeReference" aria-hidden="true">
                        {/* showAnswer 只切換顯示，仍沿用同一題保存的資料。 */}
                        <Generator round={round} showAnswer={!!result} onQuestionReady={question => /* 保存題目幾何與答案，產生完成後開放送出。 */ {
                            questionRef.current = question
                            setReady(true)
                        }} />
                    </div>
                </Canvas>
                </div>
                <footer className="BoxAnswerBar">
                    {/* 成績與操作集中在畫布下方，送出後保留完整的答案及透視比較。 */}
                    <div className="BoxFeedback" role="status" aria-live="polite">
                        {result ? <>
                            <strong className="BoxQuestionScore">{result.score}<small> / 100</small></strong>
                            <div><p>完整度 {result.coverage}% · 準確度 {result.precision}%</p>
                                <span className="BoxHint">{answerHint}</span></div>
                        </> : <div><strong>{instruction(round)}</strong>
                            <p className="BoxHint">{hint}</p></div>}
                    </div>
                    <button className="BoxPrimaryButton" disabled={!ready} onClick={result ? nextQuestion : submit}>
                        {result ? isLastRound ? "查看結算" : "繼續" : "送出"}
                    </button>
                </footer>
            </div>
        </div>
        )}
        </PageTransition>
    )
}

export default PracticeGame
