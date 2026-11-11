import { useRef, useState } from "react"
import { defaultToolShortcuts, shortcutTools, validateToolShortcuts } from "./toolShortcuts"
import "./ShortcutSettings.css"

function ShortcutSettings({ shortcuts, onSave }) {
    const dialogRef = useRef(null)
    const [draft, setDraft] = useState(shortcuts)
    const [error, setError] = useState("")
    const [status, setStatus] = useState("")

    function openSettings() {
        setDraft({ ...shortcuts })
        setError("")
        setStatus("")
        dialogRef.current.showModal()
    }

    function saveSettings(event) {
        event.preventDefault()
        const validationError = validateToolShortcuts(draft)
        setError(validationError)
        if (validationError) return

        const normalized = Object.fromEntries(shortcutTools.map(({ id }) => [id, draft[id].toLowerCase()]))
        const saved = onSave(normalized)
        setStatus(saved ? "快捷鍵設定已儲存。" : "快捷鍵已套用；瀏覽器無法儲存設定，下次開啟時可能需要重新設定。")
        dialogRef.current.close()
    }

    return (
        <div className="ShortcutSettings">
            <button type="button" className="ShortcutSettingsButton" onClick={openSettings}>
                <span aria-hidden="true">⌨</span> 快捷鍵設定
            </button>
            <p className="ShortcutSaveStatus" role="status">{status}</p>
            <dialog ref={dialogRef} className="ShortcutDialog" aria-labelledby="shortcut-title"
                aria-describedby="shortcut-description">
                <form onSubmit={saveSettings}>
                    <div className="ShortcutDialogHeader">
                        <div>
                            <p className="ShortcutEyebrow">KEYBOARD SHORTCUTS</p>
                            <h2 id="shortcut-title">快捷鍵設定</h2>
                        </div>
                        <button type="button" className="ShortcutClose" aria-label="關閉快捷鍵設定"
                            onClick={() => dialogRef.current.close()}>×</button>
                    </div>
                    <p id="shortcut-description" className="ShortcutDescription">
                        點選欄位後輸入一個英文字母、數字或按空白鍵。繪圖時按下對應按鍵即可切換工具，不分大小寫。
                    </p>
                    <div className="ShortcutFields">
                        {shortcutTools.map(({ id, label }) => (
                            <label className="ShortcutField" key={id} htmlFor={`shortcut-${id}`}>
                                <span>{label}</span>
                                <input id={`shortcut-${id}`} type="text" value={draft[id] === " " ? "空白鍵" : draft[id].toUpperCase()}
                                    maxLength={1} autoComplete="off" spellCheck={false}
                                    aria-describedby={error ? "shortcut-error" : "shortcut-description"}
                                    onFocus={event => event.target.select()}
                                    onClick={event => event.currentTarget.select()}
                                    onKeyDown={event => {
                                        if (event.key === " ") {
                                            event.preventDefault()
                                            setDraft(previous => ({ ...previous, [id]: " " }))
                                            setError("")
                                        }
                                    }}
                                    onChange={event => {
                                        setDraft(previous => ({ ...previous, [id]: event.target.value.toLowerCase() }))
                                        setError("")
                                    }} />
                            </label>
                        ))}
                    </div>
                    <p id="shortcut-error" className="ShortcutError" role="alert">{error}</p>
                    <div className="ShortcutActions">
                        <button type="button" className="ShortcutReset" onClick={() => {
                            setDraft({ ...defaultToolShortcuts })
                            setError("")
                        }}>恢復預設</button>
                        <button type="button" onClick={() => dialogRef.current.close()}>取消</button>
                        <button type="submit" className="ShortcutSave">儲存設定</button>
                    </div>
                </form>
            </dialog>
        </div>
    )
}

export default ShortcutSettings
