// menuConfig.js：模式資料設定檔：集中管理模式名稱、子模式與目的頁面，調整選單內容請優先修改這裡。

// 修改模式名稱、子模式與目的頁面；screen 為 null 代表尚未開放。
// modes：模式清單；id 是唯一識別值、title 是顯示文字、subModes 是子模式陣列。
export const modes = [
    // 方體練習：Normal 為 10 題一組；Infinity 持續出題；3 Boxes 保留後續實作。
    { id: "boxes", title: "Boxes", subModes: [
        { title: "Normal", screen: "boxNormal" }, { title: "3 Boxes", screen: null }, { title: "Infinity", screen: "boxInfinity" }] },
    // 圓形練習：Normal 前五題內切圓，後五題內切橢圓。
    { id: "circles", title: "Circles", subModes: [
        { title: "Normal", screen: "circleNormal" }, { title: "Infinity", screen: null }] },
    // 漸層練習：目前保留 Normal、Infinity 兩種子模式。
    { id: "gradient", title: "Gradient", subModes: [
        { title: "Normal", screen: null }, { title: "Infinity", screen: null }] },
    // 自由繪圖：Free Draw 進入已有的 Sketch 畫布。
    { id: "sketch", title: "Sketch", subModes: [{ title: "Free Draw", screen: "game" }] },
    // 共同練習：建立、加入及隨機房間的預留入口。
    { id: "practiceTogether", title: "Practice Together", subModes: [
        { title: "Create Room", screen: null }, { title: "Join Room", screen: null }, { title: "Random", screen: null }] },
    // 共同繪圖：建立、加入及隨機房間的預留入口。
    { id: "drawTogether", title: "Draw Together", subModes: [
        { title: "Create Room", screen: null }, { title: "Join Room", screen: null }, { title: "Random", screen: null }] },
]
