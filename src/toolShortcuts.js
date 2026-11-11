// 工具快捷鍵的預設值、驗證與本機儲存共用設定。
export const defaultToolShortcuts = { brush: "b", eraser: "e", cursor: "v", rotate: "r", hand: " " }
export const shortcutStorageKey = "drawlab.toolShortcuts"
export const shortcutTools = [
    { id: "brush", label: "Brush Tool" },
    { id: "eraser", label: "Eraser Tool" },
    { id: "cursor", label: "Cursor Tool" },
    { id: "rotate", label: "Rotate Tool" },
    { id: "hand", label: "Hand Tool" },
]

export function validateToolShortcuts(shortcuts) {
    const keys = shortcutTools.map(({ id }) => shortcuts?.[id])
    if (keys.some(key => typeof key !== "string" || !/^[a-z0-9 ]$/i.test(key))) {
        return "每個工具請設定一個英文字母、數字或空白鍵（A–Z、0–9）。"
    }
    if (new Set(keys.map(key => key.toLowerCase())).size !== keys.length) {
        return "快捷鍵不能重複，請為每個工具選擇不同的按鍵。"
    }
    return ""
}

export function loadToolShortcuts() {
    try {
        const saved = JSON.parse(window.localStorage.getItem(shortcutStorageKey))
        if (saved && typeof saved === "object" && !Array.isArray(saved) && saved.hand === undefined) {
            saved.hand = " "
        }
        // Preserve existing shortcuts when adding the rotation tool.
        if (saved && typeof saved === "object" && !Array.isArray(saved) && saved.rotate === undefined) {
            const used = Object.values(saved).map(key => String(key).toLowerCase())
            saved.rotate = [..."rabcdefghijklmnopqrstuvwxyz0123456789"].find(key => !used.includes(key))
        }
        if (!validateToolShortcuts(saved)) {
            return Object.fromEntries(shortcutTools.map(({ id }) => [id, saved[id].toLowerCase()]))
        }
    } catch {
        // 儲存空間不可用或資料損壞時仍可使用預設快捷鍵。
    }
    return { ...defaultToolShortcuts }
}
