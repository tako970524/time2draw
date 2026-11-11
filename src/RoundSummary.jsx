// RoundSummary.jsx：獨立結算畫面，可修改排版或透過 animationSlot 加入自訂動畫。
import { useEffect, useRef } from "react"
import "./RoundSummary.css"

// RoundSummary：results 為每題成績；modeName 為模式名稱；onRetry／onExit 為操作回呼。
// animationSlot：可選的 JSX 動畫區，之後可傳入 AE 匯出的 video、img 或動畫播放器。
function RoundSummary({ results, modeName = "Boxes / Normal", onRetry, onExit, animationSlot }) {
    // headingRef：進入結算頁時將鍵盤焦點移到標題，方便閱讀與後續按鈕操作。
    const headingRef = useRef(null)
    // total：本組所有題目的分數總和，sum 為累計值、result 為目前題目成績。
    const total = results.reduce((sum, result) => sum + result.score, 0)
    // average：平均分數，保留一位小數；空成績時顯示 0.0 以便元件獨立預覽。
    const average = results.length ? (total / results.length).toFixed(1) : "0.0"

    useEffect(() => {
        // 結算顯示後聚焦標題，標題本身不進入一般 Tab 按鈕順序。
        headingRef.current?.focus()
    }, [])

    return (
        <main className="RoundSummary">
            <section className="SummaryCard" aria-labelledby="summary-title">
                {/* 獨立動畫區：未提供素材時顯示簡單的平行四邊形裝飾。 */}
                <div className="SummaryAnimation" aria-hidden="true">
                    {animationSlot ?? <div className="SummaryMark"><i /><i /><i /></div>}
                </div>
                <p className="SummaryMode">{modeName}</p>
                <h1 id="summary-title" ref={headingRef} tabIndex={-1}>本組練習完成</h1>
                <p className="SummaryCaption">已完成 {results.length} 題，以下是本次成績。</p>
                <div className="SummaryAverage">
                    <span>平均分數</span><strong>{average}<small> / 100</small></strong>
                </div>
                <ol className="SummaryScores" aria-label="各題分數">
                    {results.map((result, index) => /* result 為該題成績，index 為從 0 開始的題目序號。 */ (
                        <li key={index} title={`完整度 ${result.coverage}%・準確度 ${result.precision}%`}>
                            <span>第 {index + 1} 題</span><strong>{result.score}<small> 分</small></strong>
                        </li>
                    ))}
                </ol>
                <div className="SummaryActions">
                    <button className="SummaryRetry" onClick={onRetry}>重試一組</button>
                    <button className="SummaryExit" onClick={onExit}>退出至模式選單</button>
                </div>
            </section>
        </main>
    )
}

export default RoundSummary
