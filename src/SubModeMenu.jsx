// SubModeMenu.jsx：子模式選擇區：嵌在已展開的模式卡片內，選項資料由 menuConfig.js 提供。

// 子模式區嵌在父模式的平行四邊形內，選項集中於 menuConfig.js。
// SubModeMenu：id：區塊識別；mode：模式資料；expanded：是否展開；onSelectSubMode：進入頁面的回呼。
function SubModeMenu({ id, mode, expanded, onSelectSubMode }) {
    return (
        <div id={id} className="SubModePanel" inert={!expanded} aria-hidden={!expanded}>
            <p className="SubModeLabel">{mode.title}</p>
            <h2>Select a submode</h2>
            <div className="SubModeOptions">
                {mode.subModes.map(option => /* option：目前子模式，title 是名稱、screen 是目的頁面；null 代表尚未開放。 */ (
                    <button key={option.title} className="SubModeButton" disabled={!option.screen}
                        onClick={() => /* 點選回呼：通知父元件切換頁面或工具，或更新展開狀態。 */ onSelectSubMode(option.screen)}>
                        <span>{option.title}</span>
                        <small>{option.screen ? "Play" : "Coming soon"}</small>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default SubModeMenu
