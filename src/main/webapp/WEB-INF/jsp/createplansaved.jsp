<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ page
	import="modelother.Plan, modelother.Waypoint, modelother.Expense"%>
<%@ page import="java.util.*"%>
<%@ page import="com.google.gson.Gson"%>

<%
modelother.Plan plan = (modelother.Plan) request.getAttribute("plan");

//2. 「planがあればDBの値、なければ初期値」を確実に代入する
// デフォルトを広島駅にせず、空にする
String start = (plan != null && plan.getStart() != null) ? plan.getStart() : "";
String dest = (plan != null && plan.getDestination() != null) ? plan.getDestination() : "博多駅";
String departureDate = (plan != null && plan.getDepartureDate() != null) ? plan.getDepartureDate() : "";

//3. 座標も同様に準備しておくと、下のJavaScriptに渡しやすくなります
double oLat = (plan != null) ? plan.getOriginLat() : 34.3976;
double oLng = (plan != null) ? plan.getOriginLng() : 132.4754;
double dLat = (plan != null) ? plan.getDestLat() : 33.5897;
double dLng = (plan != null) ? plan.getDestLng() : 130.4207;

// 保存済みデータがある場合は上書き
if (plan != null) {
	if (plan.getStart() != null)
		start = plan.getStart();
	if (plan.getDestination() != null)
		dest = plan.getDestination();
	if (plan.getDepartureDate() != null)
		departureDate = plan.getDepartureDate();
}

// ★ 合計費用（往路/復路）
int hotelOut = (request.getAttribute("hotelOut") != null) ? (int) request.getAttribute("hotelOut") : 0;
int foodOut = (request.getAttribute("foodOut") != null) ? (int) request.getAttribute("foodOut") : 0;
int otherOut = (request.getAttribute("otherOut") != null) ? (int) request.getAttribute("otherOut") : 0;
int transOut = (request.getAttribute("transOut") != null) ? (int) request.getAttribute("transOut") : 0;

int hotelRet = (request.getAttribute("hotelRet") != null) ? (int) request.getAttribute("hotelRet") : 0;
int foodRet = (request.getAttribute("foodRet") != null) ? (int) request.getAttribute("foodRet") : 0;
int otherRet = (request.getAttribute("otherRet") != null) ? (int) request.getAttribute("otherRet") : 0;
int transRet = (request.getAttribute("transRet") != null) ? (int) request.getAttribute("transRet") : 0;

// ★ 詳細費用一覧（transport を除外）
List<Expense> expenses = (List<Expense>) request.getAttribute("expenses");
List<Map<String, Object>> filtered = new ArrayList<>();

if (expenses != null) {
	for (Expense e : expenses) {
		if (!"transport".equals(e.getCategory())) {
	Map<String, Object> row = new HashMap<>();
	row.put("category", e.getCategory());
	row.put("label", e.getItemName());
	row.put("price", e.getPrice());
	row.put("isReturn", e.getIsReturn());
	filtered.add(row);
		}
	}
}
List<Waypoint> wpList = (plan != null && plan.getWaypoints() != null) 
? plan.getWaypoints() : new ArrayList<>();
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

var savedExpenses = <%=expensesJson%>;

var jspConfig = {
    originName: "<%=start%>",
    destName: "<%=dest%>",
    departureDate: "<%=departureDate%>",
    originLat: <%=(plan != null) ? plan.getOriginLat() : 34.3976%>,
            originLng: <%=(plan != null) ? plan.getOriginLng() : 132.4754%>,
            destLat: <%=(plan != null) ? plan.getDestLat() : 33.5897%>,
            destLng: <%=(plan != null) ? plan.getDestLng() : 130.4207%>,

            		savedWaypoints: [
            	        <% if (!wpList.isEmpty()) {
            	            for (int i = 0; i < wpList.size(); i++) { 
            	                Waypoint wp = wpList.get(i); %>
            	                {
            	                    name: "<%=wp.getName()%>",
            	                    lat: <%=wp.getLat()%>,
            	                    lng: <%=wp.getLng()%>,
            	                    stayTime: <%=wp.getStayTime()%>,
            	                    isReturn: <%=wp.isReturn()%>,
            	                    description: "<%=(wp.getDescription() != null) ? wp.getDescription() : ""%>",
            	                    sortOrder: <%= wp.getSortOrder() %>
            	                }<%= (i < wpList.size() - 1) ? "," : "" %> <%-- ★ 最後の要素以外にカンマを付ける --%>
            	        <%  }
            	        } %>
            	    ].sort((a, b) => a.sortOrder - b.sortOrder),
    savedCosts: {
        hotelOut: <%=hotelOut%>,
        foodOut: <%=foodOut%>,
        otherOut: <%=otherOut%>,
        transOut: <%=transOut%>,

        hotelRet: <%=hotelRet%>,
        foodRet: <%=foodRet%>,
        otherRet: <%=otherRet%>,
        transRet: <%=transRet%>
    },

    // ★★★ 兄弟がテストしたい “MODEL の getter 直結版” ★★★
   // ★★★ 兄弟がテストしたい “MODEL の getter 直結版” ★★★
    savedCosts2: {
        hotelOut: <%= (plan != null) ? plan.getHotelOutbound() : 0 %>,
        foodOut: <%= (plan != null) ? plan.getFoodOutbound() : 0 %>,
        otherOut: <%= (plan != null) ? plan.getOtherOutbound() : 0 %>,
        transOut: <%= (plan != null) ? plan.getTransportOutbound() : 0 %>,

        hotelRet: <%= (plan != null) ? plan.getHotelReturn() : 0 %>,
        foodRet: <%= (plan != null) ? plan.getFoodReturn() : 0 %>,
        otherRet: <%= (plan != null) ? plan.getOtherReturn() : 0 %>,
        transRet: <%= (plan != null) ? plan.getTransportReturn() : 0 %>
    }

};
</script>

</head>

<body>

	<div id="map"></div>
	<a href="index.jsp" class="btn-home" id="home-btn">🏠</a>

	<div class="left-panel" id="left-panel">
		<button class="toggle-btn left-toggle"
			onclick="togglePanel('left-panel')">◀</button>
		<div class="scroll-content">

			<!-- 💰 合計予算エリア -->
			<div
				style="background: white; border-radius: 15px; padding: 15px; margin-bottom: 15px; border: 2px solid #ffcc00; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
				<div
					style="color: #d2691e; font-weight: bold; border-bottom: 2px solid #ffcc00; margin-bottom: 8px; padding-bottom: 5px; font-size: 0.9em;">
					💰 旅の合計予算（往復総合計）</div>

				<div id="grand-total-display"
					style="font-size: 1.8em; font-weight: bold; color: #ff4500; text-align: center;">
					¥ 0</div>

				<div
					style="display: flex; justify-content: space-around; font-size: 0.75em; margin-top: 8px; color: #666; border-top: 1px dashed #eee; pt: 5px;">
					<div>
						往路: <span id="outbound-total-sub">¥ 0</span>
					</div>
					<div>
						復路: <span id="return-total-sub">¥ 0</span>
					</div>
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
						<input type="checkbox" id="reverse-mode"
						onchange="toggleReverseArea()"> 🏁 逆算モード（到着目標）
					</label>

					<div id="target-time-area" style="margin-top: 5px; display: none;">
						<small>到着希望時刻:</small><br> <input type="time"
							id="target-time" value="18:00" onchange="getRoute()">
					</div>
				</div>

				<input type="text" id="origin-input" value="<%=start%>"
					placeholder="出発地" onchange="syncAddress()">

				<div id="mode-display" style="margin: 10px 0;">
					<span id="mode-badge" class="badge-outbound"
						style="background: #3498db; color: white; padding: 3px 10px; border-radius: 10px; font-size: 0.8em;">
						✈️ 往路（行き）を編集中 </span>
				</div>

				<div style="text-align: center; margin: 10px 0;">
					<button type="button" class="reverse-btn" onclick="reverseRoute()">
						🔄 往復入れ替え</button>
				</div>

				<input type="text" id="dest-input" value="<%=dest%>"
					placeholder="目的地" onchange="syncAddress()">

				<div style="margin-top: 10px;">
					<small>出発時刻</small><br> <input type="date" id="start-date"
						value="<%=departureDate%>" onchange="getRoute()"
						style="width: 48%;"> <input type="time" id="start-time"
						value="08:00" onchange="getRoute()" style="width: 45%;">
				</div>
			</div>
			<!-- 📍 往路中継地 -->
			<div class="section-title">
				📍 往路 中継地
				<button class="add-btn" onclick="addNewWaypoint()">＋追加</button>
			</div>

			<!-- リストのコンテナも念のため消しておきます -->
			<div id="waypoint-list-container"\></div>

			<!-- 📍 復路中継地 -->
			<div class="section-title"
				style="border-top: 1px dashed #ccc; margin-top: 20px; padding-top: 10px; display: none;">
				📍 復路（帰り）中継地
				<button class="add-btn" style="background: #e67e22;"
					onclick="addReturnWaypoint()">＋追加</button>
			</div>

			<div id="return-waypoint-list-container" style="display: none;"></div>
			<!-- 🏨 宿泊費 -->
			<div class="section-title">
				🏨 宿泊費
				<button class="add-btn"
					onclick="addInputRow('hotel-container', '宿泊')">＋追加</button>
			</div>

			<div id="hotel-container" class="input-container">
				<div class="dynamic-input-row">
					<input type="text" value="宿泊費"> <input type="number"
						id="hotel-fee" name="hotelFee" value="0"
						oninput="updateGrandTotalSafe()">
				</div>
			</div>

			<!-- 🍖 食費 -->
			<div class="section-title">
				🍖 食費
				<button class="add-btn"
					onclick="addInputRow('food-container', '食事')">＋追加</button>
			</div>

			<div id="food-container" class="input-container">
				<div class="dynamic-input-row">
					<input type="text" value="食費合計"> <input type="number"
						id="food-fee" name="foodFee" value="0"
						oninput="updateGrandTotalSafe()">
				</div>
			</div>

			<!-- 🎁 その他 -->
			<div class="section-title">
				🎁 その他
				<button class="add-btn"
					onclick="addInputRow('other-container', '項目')">＋追加</button>
			</div>

			<div id="other-container" class="input-container">
				<div class="dynamic-input-row">
					<input type="text" value="お土産代"> <input type="number"
						id="other-fee" name="otherFee" value="0"
						oninput="updateGrandTotalSafe()">
				</div>
			</div>

			<!-- 💾 保存ボタン -->
			<button type="button" class="btn-main" onclick="saveFullPlan()"
				style="background: #2ecc71; margin-top: 10px; color: white;">
				💾 計画をすべて保存</button>

		</div>
		<!-- scroll-content -->
	</div>
	<!-- left-panel -->

	<!-- 📘 右側ナビパネル -->
	<div class="info-panel" id="info-panel">
		<button class="toggle-btn right-toggle"
			onclick="togglePanel('info-panel')">▶</button>

		<div
			style="background: var(--dog-gold); color: white; padding: 12px; text-align: center; font-weight: bold;">
			🐾 旅のナビ</div>

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

	<script src="js/trip_saved.js"></script>

	<script>
// ===============================================
// ★ 詳細費用（宿泊費・食費・その他）を分類
// ===============================================
console.log("🔥 JSP SCRIPT START");
console.log("savedExpenses =", savedExpenses);

var outboundExpenses = { hotel: [], food: [], other: [] };
var returnExpenses   = { hotel: [], food: [], other: [] };

console.log("savedExpenses =", savedExpenses);

// ===============================================
// ★ savedExpenses を往路/復路に振り分け
// ===============================================
if (Array.isArray(savedExpenses)) {
    savedExpenses.forEach(exp => {
        var target = exp.isReturn === 0 ? outboundExpenses : returnExpenses;

        if (target[exp.category]) {
            target[exp.category].push({
                label: exp.label ?? exp.itemName,
                price: exp.price
            });
        }
    });
}

// ===============================================
// ★ 左パネルへ保存済み費用を反映（今回追加）
// ===============================================
function restoreLeftPanelCosts(savedCosts) {
    if (!savedCosts) return;

    // 宿泊費
    if (document.getElementById("hotel-fee")) {
        document.getElementById("hotel-fee").value = savedCosts.hotelOut ?? 0;
    }

    // 食費
    if (document.getElementById("food-fee")) {
        document.getElementById("food-fee").value = savedCosts.foodOut ?? 0;
    }

    // その他
    if (document.getElementById("other-fee")) {
        document.getElementById("other-fee").value = savedCosts.otherOut ?? 0;
    }

    // ガソリン
    if (document.getElementById("disp-gas")) {
        document.getElementById("disp-gas").innerText =
            "¥ " + (savedCosts.gas ?? 0).toLocaleString();
    }

    // 高速
    if (document.getElementById("disp-highway")) {
        document.getElementById("disp-highway").innerText =
            "¥ " + (savedCosts.highway ?? 0).toLocaleString();
    }
}

// ===============================================
// ★ HTML に費用行を追加する（兄弟の UI 専用）
// ===============================================
function addExpenseRow(containerId, label, price) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var row = document.createElement("div");
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
// ===============================================
// ★ 保存済みデータの復元と最終集計（メイン処理）
// ===============================================
window.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 復元処理を開始します");

    // --- 追加: 確実に値を固定するための関数 ---
    const forceUpdateInputs = () => {
        const originInp = document.getElementById("origin-input");
        const destInp = document.getElementById("dest-input");
        const dateInp = document.getElementById("departure-date");

        if (originInp && jspConfig.originName) {
            originInp.value = jspConfig.originName;
            console.log("📍 出発地をセット:", jspConfig.originName);
        }
        if (destInp && jspConfig.destName) {
            destInp.value = jspConfig.destName;
            console.log("📍 目的地をセット:", jspConfig.destName);
        }
        if (dateInp && jspConfig.departureDate) {
            dateInp.value = jspConfig.departureDate;
        }
    };

    // 1. まず即座にセットを試みる
    forceUpdateInputs();

    // 2. 0.5秒後、他のJS（trip_saved.js等）の初期化が終わったタイミングで再度上書き
    // ※ ここで広島駅に戻されるのを防ぐ
    setTimeout(() => {
        console.log("🛠️ 念のための再セット実行");
        forceUpdateInputs();
    }, 500);

    // 3. 【費用セット】UIの構築（innerHTMLの書き換え等）を待機
    setTimeout(() => {
        if (typeof autoFillExpenseFields === 'function' && typeof savedExpenses !== 'undefined') {
            console.log("💰 UI構築完了を待ってから、費用をセットします...");
            autoFillExpenseFields(savedExpenses);
            updateGrandTotalSafe();
        }
    }, 1500);

    // 4. 最終確認
    setTimeout(() => {
        updateGrandTotalSafe();
        console.log("✅ 全ての復元と集計が完了しました");
    }, 3500);
}); 
 function autoFillExpenseFields(expenses) {
	    if (!expenses || !Array.isArray(expenses)) return;

	    const currentMode = (typeof isReturnTrip !== 'undefined' && isReturnTrip) ? 1 : 0;
	    const totals = { hotel: 0, food: 0, other: 0 };
	    
	    expenses.forEach(item => {
	        const itemIsReturn = (item.is_return !== undefined) ? item.is_return : item.isReturn;
	        if (Number(itemIsReturn) === currentMode) {
	            if (totals.hasOwnProperty(item.category)) {
	                totals[item.category] += (Number(item.price) || Number(item.amount) || 0);
	            }
	        }
	    });

	    console.log("📊 [AutoFill] 集計結果:", totals);

	    // --- ここからが「箱がなければ作る」ロジック ---
	    const checkAndAdd = (containerId, label, value, inputId) => {
	        let container = document.getElementById(containerId);
	        if (!container) return;

	        // すでに入力欄があるか確認
	        let input = container.querySelector('input[type="number"]');
	        
	        // 入力欄がなければ「＋追加」ボタンと同じ処理（addExpenseRow）を呼ぶ
	        if (!input) {
	            console.log(`🏗️ ${label}の枠がないので作成します...`);
	            if (typeof addExpenseRow === 'function') {
	                addExpenseRow(containerId, label, value);
	            }
	        } else {
	            // すでにある場合は値を上書き
	            input.value = value;
	            input.id = inputId;
	        }
	    };

	    // 各カテゴリーごとに箱チェック＆投入
	    checkAndAdd('hotel-container', '宿泊費', totals.hotel, 'hotel-fee');
	    checkAndAdd('food-container',  '食費合計', totals.food, 'food-fee');
	    checkAndAdd('other-container', 'その他', totals.other, 'other-fee');

	    // 最後に合計を計算
	    setTimeout(() => {
	        if (typeof updateGrandTotalSafe === 'function') updateGrandTotalSafe();
	    }, 100);

	    console.log("✨ [Success] 自動枠作成と反映が完了しました");
	}
function updateGrandTotalSafe() {
    try {
        const getVal = (id) => {
            const el = document.getElementById(id);
            return el ? (Number(el.value) || 0) : 0;
        };

        const h = getVal('hotel-fee');
        const f = getVal('food-fee');
        const o = getVal('other-fee');

        // 移動費（trip_saved.js側で計算されたグローバル変数）
        const gas = window.gasCost || 0;
        const high = window.highwayCost || 0;

        const total = h + f + o + gas + high;

        // UI表示の更新
        const updateText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.innerText = text;
        };

        const fmt = "¥ " + total.toLocaleString();
        updateText('grand-total-display', fmt);
        updateText('disp-total', fmt);
        updateText('disp-hotel', "¥ " + h.toLocaleString());
        updateText('disp-food',  "¥ " + f.toLocaleString());
        updateText('disp-other', "¥ " + o.toLocaleString());
        updateText('disp-gas',   "¥ " + gas.toLocaleString());
        updateText('disp-highway', "¥ " + high.toLocaleString());

        console.log("💰 [JSP集計] 固定:" + (h + f + o) + " + 移動:" + (gas + high) + " = 合計:" + total);

    } catch (e) {
        console.error("集計エラー:", e);
    }
}
</script>

</body>
</html>