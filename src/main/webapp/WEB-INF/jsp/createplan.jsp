<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="modelother.Plan, modelother.Waypoint, modelother.Expense"%>
<%@ page import="java.util.*" %>
<%@ page import="com.google.gson.Gson" %>

<%
Plan plan = (Plan) request.getAttribute("plan");

// デフォルト値（新規作成時）
String start = "広島駅";
String dest = "博多駅";
String departureDate = "";

// 保存済みデータがある場合は上書き
if (plan != null) {
    if (plan.getStart() != null) start = plan.getStart();
    if (plan.getDestination() != null) dest = plan.getDestination();
    if (plan.getDepartureDate() != null) departureDate = plan.getDepartureDate();
}

// ★ 合計費用（往路/復路）
int hotelOut = (request.getAttribute("hotelOut") != null) ? (int)request.getAttribute("hotelOut") : 0;
int foodOut  = (request.getAttribute("foodOut")  != null) ? (int)request.getAttribute("foodOut")  : 0;
int otherOut = (request.getAttribute("otherOut") != null) ? (int)request.getAttribute("otherOut") : 0;
int transOut = (request.getAttribute("transOut") != null) ? (int)request.getAttribute("transOut") : 0;

int hotelRet = (request.getAttribute("hotelRet") != null) ? (int)request.getAttribute("hotelRet") : 0;
int foodRet  = (request.getAttribute("foodRet")  != null) ? (int)request.getAttribute("foodRet")  : 0;
int otherRet = (request.getAttribute("otherRet") != null) ? (int)request.getAttribute("otherRet") : 0;
int transRet = (request.getAttribute("transRet") != null) ? (int)request.getAttribute("transRet") : 0;

// ★ 詳細費用一覧（transport を除外）
List<Expense> expenses = (List<Expense>) request.getAttribute("expenses");
List<Map<String,Object>> filtered = new ArrayList<>();

if (expenses != null) {
    for (Expense e : expenses) {
        if (!"transport".equals(e.getCategory())) {
            Map<String,Object> row = new HashMap<>();
            row.put("category", e.getCategory());
            row.put("label", e.getItemName());
            row.put("price", e.getPrice());
            row.put("isReturn", e.getIsReturn());
            filtered.add(row);
        }
    }
}

Gson gson = new Gson();
String expensesJson = gson.toJson(filtered);
%>

<!DOCTYPE html>
<html lang="ja">
<head>

<meta charset="UTF-8">
<title>TripPlan - 🐾 究極フルナビ・完全版</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<link rel="stylesheet" href="css/trip.css">

<!-- ★ JSP → JS データ受け渡し（正しい位置に移動済み） -->
<script>

const savedExpenses = <%= expensesJson %>;

const jspConfig = {
    originName: "<%=start%>",
    destName: "<%=dest%>",
    departureDate: "<%=departureDate%>",

    savedWaypoints: [
        <% if (plan != null && plan.getWaypoints() != null) {
            for (Waypoint wp : plan.getWaypoints()) { %>
                {
                    name: "<%=wp.getName()%>",
                    lat: <%=wp.getLat()%>,
                    lng: <%=wp.getLng()%>,
                    stayTime: <%=wp.getStayTime()%>,
                    isReturn: <%=wp.isReturn()%>,
                    description: "<%= (wp.getDescription() != null) ? wp.getDescription() : "" %>"
                },
        <% } } %>
    ],

    savedCosts: {
        hotelOut: <%=hotelOut%>,
        foodOut: <%=foodOut%>,
        otherOut: <%=otherOut%>,
        transOut: <%=transOut%>,

        hotelRet: <%=hotelRet%>,
        foodRet: <%=foodRet%>,
        otherRet: <%=otherRet%>,
        transRet: <%=transRet%>
    }
};
</script>

</head>

<body>

<div id="map"></div>
<a href="index.jsp" class="btn-home" id="home-btn">🏠</a>

<div class="left-panel" id="left-panel">
    <button class="toggle-btn left-toggle" onclick="togglePanel('left-panel')">◀</button>
    <div class="scroll-content">

        <!-- 💰 合計予算エリア -->
        <div
            style="background: white; border-radius: 15px; padding: 15px; margin-bottom: 15px; border: 2px solid #ffcc00; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
            <div
                style="color: #d2691e; font-weight: bold; border-bottom: 2px solid #ffcc00; margin-bottom: 8px; padding-bottom: 5px; font-size: 0.9em;">
                💰 旅の合計予算（往復総合計）
            </div>

            <div id="grand-total-display"
                style="font-size: 1.8em; font-weight: bold; color: #ff4500; text-align: center;">
                ¥ 0
            </div>

            <div
                style="display: flex; justify-content: space-around; font-size: 0.75em; margin-top: 8px; color: #666; border-top: 1px dashed #eee; pt: 5px;">
                <div>往路: <span id="outbound-total-sub">¥ 0</span></div>
                <div>復路: <span id="return-total-sub">¥ 0</span></div>
            </div>
        </div>

        <!-- 🧮 詳細費用エリア -->
        <div class="cost-display">
            <div style="font-size: 0.8em; opacity: 0.8;">🐾 旅のリアルタイム合計予算</div>
            <div class="total-amount" id="disp-total">¥ 0</div>

            <div style="margin-top: 10px;">
                <div class="cost-item-row">
                    <span>🛣️ 総走行距離</span><span id="disp-distance">0 km</span>
                </div>
                <div class="cost-item-row">
                    <span>⏱️ 予想時間</span><span id="disp-time">0分</span>
                </div>
                <div class="cost-item-row">
                    <span>⛽ ガソリン</span><span id="disp-gas">¥ 0</span>
                </div>
                <div class="cost-item-row">
                    <span>🛣️ 高速道路</span><span id="disp-highway">¥ 0</span>
                </div>
                <div class="cost-item-row">
                    <span>🏨 宿泊費</span><span id="disp-hotel">¥ 0</span>
                </div>
                <div class="cost-item-row">
                    <span>🍖 食費</span><span id="disp-food">¥ 0</span>
                </div>
                <div class="cost-item-row">
                    <span>🛍️ その他</span><span id="disp-other">¥ 0</span>
                </div>
            </div>
        </div>

        <!-- 🚩 ルート設定 -->
        <div class="section-title">🚩 ルート設定</div>

        <div class="input-container">
            <div
                style="background: #fff0f0; padding: 10px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #ffcccc;">
                <label
                    style="font-weight: bold; font-size: 0.85em; cursor: pointer; color: #d63031;">
                    <input type="checkbox" id="reverse-mode" onchange="toggleReverseArea()">
                    🏁 逆算モード（到着目標）
                </label>

                <div id="target-time-area" style="margin-top: 5px; display: none;">
                    <small>到着希望時刻:</small><br>
                    <input type="time" id="target-time" value="18:00" onchange="getRoute()">
                </div>
            </div>

            <input type="text" id="origin-input" value="<%=start%>"
                placeholder="出発地" onchange="syncAddress()">

            <div id="mode-display" style="margin: 10px 0;">
                <span id="mode-badge" class="badge-outbound"
                    style="background: #3498db; color: white; padding: 3px 10px; border-radius: 10px; font-size: 0.8em;">
                    ✈️ 往路（行き）を編集中
                </span>
            </div>

            <div style="text-align: center; margin: 10px 0;">
                <button type="button" class="reverse-btn" onclick="reverseRoute()">
                    🔄 往復入れ替え
                </button>
            </div>

            <input type="text" id="dest-input" value="<%=dest%>"
                placeholder="目的地" onchange="syncAddress()">

            <div style="margin-top: 10px;">
                <small>出発時刻</small><br>
                <input type="date" id="start-date" value="<%=departureDate%>"
                    onchange="getRoute()" style="width: 48%;">
                <input type="time" id="start-time" value="08:00"
                    onchange="getRoute()" style="width: 45%;">
            </div>
        </div>
        <!-- 📍 往路中継地 -->
<div class="section-title">
    📍  中継地
    <button class="add-btn" onclick="addNewWaypoint()">＋追加</button>
</div>

<div id="waypoint-list-container"></div>

<!-- 📍 復路中継地 -->
<!-- 複数のスタイルをまとめ、最後に display: none; を追加しました -->
<div class="section-title"
    style="border-top: 1px dashed #ccc; margin-top: 20px; padding-top: 10px; display: none;">
    📍 復路（帰り）中継地
    <button class="add-btn" style="background: #e67e22;"
        onclick="addReturnWaypoint()">＋追加</button>
</div>

<div id="return-waypoint-list-container"style="display: none;"></div>

        <!-- 🏨 宿泊費 -->
        <div class="section-title">
            🏨 宿泊費
            <button class="add-btn" onclick="addInputRow('hotel-container', '宿泊')">＋追加</button>
        </div>

        <div id="hotel-container" class="input-container">
            <div class="dynamic-input-row">
                <input type="text" value="宿泊費">
                <input type="number" id="hotel-fee" name="hotelFee" value="0"
                    oninput="updateGrandTotalSafe()">
            </div>
        </div>

        <!-- 🍖 食費 -->
        <div class="section-title">
            🍖 食費
            <button class="add-btn" onclick="addInputRow('food-container', '食事')">＋追加</button>
        </div>

        <div id="food-container" class="input-container">
            <div class="dynamic-input-row">
                <input type="text" value="食費合計">
                <input type="number" id="food-fee" name="foodFee" value="0"
                    oninput="updateGrandTotalSafe()">
            </div>
        </div>

        <!-- 🎁 その他 -->
        <div class="section-title">
            🎁 その他
            <button class="add-btn" onclick="addInputRow('other-container', '項目')">＋追加</button>
        </div>

        <div id="other-container" class="input-container">
            <div class="dynamic-input-row">
                <input type="text" value="お土産代">
                <input type="number" id="other-fee" name="otherFee" value="0"
                    oninput="updateGrandTotalSafe()">
            </div>
        </div>

        <!-- 💾 保存ボタン -->
        <button type="button" class="btn-main" onclick="saveFullPlan()"
            style="background: #2ecc71; margin-top: 10px; color: white;">
            💾 計画をすべて保存
        </button>

    </div> <!-- scroll-content -->
</div> <!-- left-panel -->

<!-- 📘 右側ナビパネル -->
<div class="info-panel" id="info-panel">
    <button class="toggle-btn right-toggle" onclick="togglePanel('info-panel')">▶</button>

    <div style="background: var(--dog-gold); color: white; padding: 12px; text-align: center; font-weight: bold;">
        🐾 旅のナビ
    </div>

    <div class="tab-menu">
        <button class="tab-btn active" onclick="switchRightTab('nav')">周辺ナビ</button>
        <button class="tab-btn" onclick="switchRightTab('timeline')">時間割</button>
    </div>

    <div class="content-area" id="right-panel-content"></div>
</div>
   <!-- ============================= -->
<!-- 📌 JS 読み込み -->
<!-- ============================= -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="js/trip.js"></script>

<script>
// ===============================================
// ★ 詳細費用（宿泊費・食費・その他）を分類
// ===============================================
console.log("🔥 JSP SCRIPT START");
console.log("savedExpenses =", savedExpenses);
const jspoutboundExpenses = { hotel: [], food: [], other: [] };
const jspreturnExpenses   = { hotel: [], food: [], other: [] };

console.log("savedExpenses =", savedExpenses);

if (Array.isArray(savedExpenses)) {
    savedExpenses.forEach(exp => {
        const target = exp.isReturn === 0 ? jspoutboundExpenses : jspreturnExpenses;

        if (target[exp.category]) {
            target[exp.category].push({
                label: exp.label ?? exp.itemName,
                price: exp.price
            });
        }
    });
}

// ===============================================
// ★ HTML に費用行を追加する（兄弟の UI 専用）
// ===============================================
function addExpenseRow(containerId, label, price) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const row = document.createElement("div");
    row.classList.add("dynamic-input-row");

    row.innerHTML = `
        <input type="text" value="${label}">
        <input type="number" value="${price}" oninput="updateGrandTotalSafe()">
    `;

    container.appendChild(row);
}

// ===============================================
// ★ 保存済みデータの復元（メイン処理）
// ===============================================
window.addEventListener("DOMContentLoaded", () => {

    // --- 出発地・目的地・日付 ---
    document.getElementById("origin-input").value = jspConfig.originName;
    document.getElementById("dest-input").value   = jspConfig.destName;

    if (jspConfig.departureDate) {
        document.getElementById("start-date").value = jspConfig.departureDate;
    }

    // --- 経由地（往路 + 復路） ---
    if (jspConfig.savedWaypoints && jspConfig.savedWaypoints.length > 0) {
        jspConfig.savedWaypoints.forEach(wp => {
            if (wp.isReturn === 0) {
                addNewWaypoint(wp.name, wp.lat, wp.lng, wp.stayTime, wp.description);
            } else {
                addReturnWaypoint(wp.name, wp.lat, wp.lng, wp.stayTime, wp.description);
            }
        });
    }
    
    // --- 合計費用（旧仕様：1 行目に入れる） ---
    document.getElementById("hotel-fee").value = jspConfig.savedCosts.hotelOut;
    document.getElementById("food-fee").value  = jspConfig.savedCosts.foodOut;
    document.getElementById("other-fee").value = jspConfig.savedCosts.otherOut;

    // --- 詳細費用（往路） ---
    jspoutboundExpenses.hotel.forEach(e => addExpenseRow("hotel-container", e.label, e.price));
    jspoutboundExpenses.food.forEach(e  => addExpenseRow("food-container",  e.label, e.price));
    jspoutboundExpenses.other.forEach(e => addExpenseRow("other-container", e.label, e.price));

    // --- 詳細費用（復路） ---
    jspreturnExpenses.hotel.forEach(e => addExpenseRow("hotel-container", e.label, e.price));
    jspreturnExpenses.food.forEach(e  => addExpenseRow("food-container",  e.label, e.price));
    jspreturnExpenses.other.forEach(e => addExpenseRow("other-container", e.label, e.price));

    // --- 合計金額の再計算 ---
    updateGrandTotalSafe();

    console.log("📌 保存済みデータを完全復元しました");
});

// ===============================================
// ★ 合計金額の再計算（安全版）
// ===============================================
function updateGrandTotalSafe() {
    try {
        // 1. 入力値取得
        const h = Number(document.getElementById('hotel-fee')?.value) || 0;
        const f = Number(document.getElementById('food-fee')?.value) || 0;
        const o = Number(document.getElementById('other-fee')?.value) || 0;

        // 2. ガソリン・高速（画面 or window から取得）
        const getPriceFromDisplay = (id) => {
            const text = document.getElementById(id)?.innerText || "0";
            return Number(text.replace(/[^0-9]/g, "")) || 0;
        };

        const gas  = window.gasCost     || getPriceFromDisplay('disp-gas');
        const high = window.highwayCost || getPriceFromDisplay('disp-highway');

        // 3. 合計
        const total = h + f + o + gas + high;
        const fmt = "¥ " + total.toLocaleString();

        // 4. 画面反映
        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        };

        set('grand-total-display', fmt);
        set('disp-total', fmt);
        set('outbound-total-sub', fmt);

        set('disp-hotel', "¥ " + h.toLocaleString());
        set('disp-food',  "¥ " + f.toLocaleString());
        set('disp-other', "¥ " + o.toLocaleString());

        console.log("計算完了:", total);

    } catch (e) {
        console.error("計算中にエラー:", e);
    }
}
</script>

</body>
</html>
        