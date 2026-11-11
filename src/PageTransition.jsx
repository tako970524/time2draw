// PageTransition.jsx：通用頁面切換動畫：依 pageKey 播放遮罩，可替換 AE 匯出素材；首次進入首頁不播放。

// 匯入 useState：建立會觸發重新渲染的狀態。
import { useState } from "react"
// 載入此元件的 CSS 樣式。
import "./PageTransition.css"

// AE 匯出素材放在 public/animations，再於下方設定素材網址。
// video 可用 MP4/WebM；image 可用 GIF/APNG/SVG；未提供素材時使用 CSS 動畫。
// transitionConfig：切換動畫設定；素材放 public/animations，時間以毫秒指定。
const transitionConfig = {
    // durationMs：遮罩停留與淡出的總時間，單位毫秒；可配合 AE 素材長度調整。
    durationMs: 700,
    // mediaSrc：動畫網址，public/animations 的檔案用 /animations/檔名；空字串使用 CSS 動畫。
    mediaSrc: "",
    // mediaType：video 播放影片，image 顯示 GIF、APNG 或 SVG 圖片。
    mediaType: "video",
    // label：遮罩上顯示的文字，也供輔助閱讀工具辨識載入狀態。
    label: "Loading",
}

// TransitionOverlay：config：動畫設定；onComplete：遮罩動畫完成後通知父元件移除遮罩。
function TransitionOverlay({ config, onComplete }) {
    // mediaFailed：自訂動畫素材是否載入失敗；setMediaFailed：記錄載入失敗並改用預設 CSS 動畫。
    const [mediaFailed, setMediaFailed] = useState(false)
    // reduceMotion：使用者系統是否要求減少動畫。
    const [reduceMotion] = useState(() => /* 狀態初始值回呼：讀取系統減少動畫設定。 */ window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    // showMedia：只有素材存在、未載入失敗且允許動畫時才播放自訂素材。
    const showMedia = config.mediaSrc && !mediaFailed && !reduceMotion
    return (
        <div className="PageTransitionOverlay" role="status" aria-label={config.label}
            style={{ "--transition-duration": `${reduceMotion ? 1 : config.durationMs}ms` }}
            onAnimationEnd={event => /* 動畫結束回呼：event 為動畫事件；只處理遮罩自身的動畫。 */ {
                if (event.target === event.currentTarget) onComplete()
            }}>
            <div className="PageTransitionContent">
                {/* 有素材時播放影片或圖片；沒有素材則顯示 CSS 斜柱動畫。 */}
                {showMedia ? config.mediaType === "video" ? (
                    <video className="PageTransitionMedia" src={config.mediaSrc} autoPlay muted playsInline
                        onError={() => /* 素材載入失敗回呼：記錄失敗並改用預設動畫。 */ setMediaFailed(true)} aria-hidden="true" />
                ) : (
                    <img className="PageTransitionMedia" src={config.mediaSrc} alt="" onError={() => /* 素材載入失敗回呼：記錄失敗並改用預設動畫。 */ setMediaFailed(true)} />
                ) : <div className="PageTransitionLoader" aria-hidden="true"><i /><i /><i /></div>}
                <p>{config.label}</p>
            </div>
        </div>
    )
}

// 只有 pageKey 改變才重播遮罩；繪圖、換工具與下一題不觸發。
// PageTransition：pageKey：頁面代號；children：頁面內容；initialPage：不播放動畫的初始頁面；config：動畫設定。
function PageTransition({ pageKey, children, initialPage = "start", config = transitionConfig }) {
    // completedPage：最近完成切換動畫的頁面代號；setCompletedPage：記錄已完成的頁面以移除遮罩。
    const [completedPage, setCompletedPage] = useState(initialPage)
    // transitioning：是否還在播放目前頁面的切換動畫，期間停用底下內容互動。
    const transitioning = pageKey !== initialPage && completedPage !== pageKey
    return (
        <div className="PageTransition">
            {/* inert 暫停底下頁面的點擊及鍵盤焦點，直到動畫完成。 */}
            <div className="PageTransitionPage" inert={transitioning}>{children}</div>
            {transitioning && <TransitionOverlay key={pageKey} config={config}
                onComplete={() => /* 動畫完成回呼：記錄目前頁面並移除遮罩。 */ setCompletedPage(pageKey)} />}
        </div>
    )
}

export default PageTransition
