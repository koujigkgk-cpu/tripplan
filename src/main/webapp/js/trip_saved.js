// --- 1. グローバル変数の定義（すべて半角英数で！） ---

// A. まず大元の変数を定義する
var jspoutboundExpenses = { hotel: [], food: [], other: [], gas: 0, highway: 0 };
var jspreturnExpenses = { hotel: [], food: [], other: [], gas: 0, highway: 0 };

// B. その後に「呪い対策」の代名詞を作る
var outboundExp = jspoutboundExpenses;
var returnExp = jspreturnExpenses;

// C. その他の変数
var map;
var routeLayer;
var waypoints = [];
var locations = {
    origin: { id: 'origin', name: "出発地", latlng: [34.3976, 132.4754], marker: null },
    dest: { id: 'dest', name: "目的地", latlng: [33.5897, 130.4207], marker: null }
};
var outboundDistanceKm = 0;
var outboundDurationText = "";

var returnDistanceKm = 0;
var returnDurationText = "";

var isReturnTrip = false;
var currentRightTab = 'nav';
var totalDistanceKm = 0;     // 総距離（km）
var totalDurationText = "";
var outboundWaypoints = [];
var returnWaypoints = [];
var outboundEvents = {};
var returnEvents = {};

var outboundFinalCost = 0;
var gasCost = 0;
var highwayCost = 0;
var customEvents = {};
var geocodeTimer;
var routeLegs = [];
(function() {
    function syncAddress() {
		console.log("--- syncAddress開始（物理クリア実行） ---");
			console.trace("🔎 syncAddressが呼ばれました。呼び出し元はこちら：");
        // map や locations が準備できていないなら中止
        if (typeof map === 'undefined' || typeof locations === 'undefined') return;

        var o = document.getElementById('origin-input');
        var d = document.getElementById('dest-input');
        if (!o || !d || !o.value || !d.value) return;

        var url = 'https://nominatim.openstreetmap.org/search?format=json&q=';

        // async/await を使わず、古典的な .then() で繋ぐ
        fetch(url + encodeURIComponent(o.value))
            .then(function(r1) { return r1.json(); })
            .then(function(j1) {
                return fetch(url + encodeURIComponent(d.value))
                    .then(function(r2) { return r2.json(); })
                    .then(function(j2) {
                        // 両方の座標が見つかった場合
                        if (j1.length > 0 && j2.length > 0) {
                            locations.origin.latlng = [parseFloat(j1[0].lat), parseFloat(j1[0].lon)];
                            locations.dest.latlng = [parseFloat(j2[0].lat), parseFloat(j2[0].lon)];

                            if (locations.origin.marker) map.removeLayer(locations.origin.marker);
                            if (locations.dest.marker) map.removeLayer(locations.dest.marker);

                            if (typeof addMainMarkers === 'function') addMainMarkers();
                            if (typeof getRoute === 'function') getRoute();
                        }
                    });
            })
            .catch(function(e) { console.error(e); });
    }

    // イベント登録も最も古い形式で
    document.addEventListener('change', function(e) {
        if (e.target && (e.target.id === 'origin-input' || e.target.id === 'dest-input')) {
            syncAddress();
        }
    });
})();

function buildCoordsArray() {
    var coordsArr = [];

    if (locations.origin && locations.origin.latlng) {
        coordsArr.push(locations.origin.latlng);
    }

    var active = isReturnTrip ? returnWaypoints : waypoints;
    active.forEach(w => {
        if (w.latlng) coordsArr.push(w.latlng);
    });

    if (locations.dest && locations.dest.latlng) {
        coordsArr.push(locations.dest.latlng);
    }

    return coordsArr;
}
function fetchRouteData(coordsArr) {
    var coordsStr = coordsArr.map(function(c) {
        return c[1] + ',' + c[0];
    }).join(';');

    var url = "https://router.project-osrm.org/route/v1/driving/" +
        coordsStr +
        "?overview=full&geometries=geojson&steps=true";

    return fetch(url)
        .then(function(res) {
            return res.json();
        })
        .then(function(data) {
            if (data.code !== "Ok") return null;
            return data.routes[0];
        });
}
/*function drawRouteLine(rt) {
    if (routeLayer) map.removeLayer(routeLayer);

    routeLayer = L.polyline(
        rt.geometry.coordinates.map(c => [c[1], c[0]]),
        { color: '#4a90e2', weight: 5, opacity: 0.7 }
    ).addTo(map);
}*/
function computeRouteInfo(rt) {
    var distanceKm = (rt.distance / 1000).toFixed(1);
    var h = Math.floor(rt.duration / 3600);
    var m = Math.floor((rt.duration % 3600) / 60);
    var durationText = (h > 0 ? `${h}時間 ` : "") + `${m}分`;

    return { distanceKm, durationText };
}
function updateRouteState(distanceKm, durationText) {
    totalDistanceKm = parseFloat(distanceKm);
    totalDurationText = durationText;

    if (isReturnTrip) {
        returnDistanceKm = totalDistanceKm;
        returnDurationText = totalDurationText;
    } else {
        outboundDistanceKm = totalDistanceKm;
        outboundDurationText = totalDurationText;
    }
}
function updateRouteUI(distanceKm, durationText) {
    document.getElementById('disp-distance').innerText = `${distanceKm} km`;
    document.getElementById('disp-time').innerText = durationText;
}
function getRoute() {
    var coordsArr = buildCoordsArray();
    if (coordsArr.length < 2) return;

    fetchRouteData(coordsArr).then(function(rt) {
        if (!rt) return;

        // --- 古い方にあった大事な変数の保存を追加 ---
        if (rt.legs) {
            routeLegs = rt.legs; // これを入れれば古い方は消しても大丈夫！
        }

        drawRouteLine(rt);

        var info = computeRouteInfo(rt);
        var distanceKm = info.distanceKm;
        var durationText = info.durationText;

        updateRouteState(distanceKm, durationText);
        updateRouteUI(distanceKm, durationText);

        calcTotal();
        updateTimeline();
        renderFullNav();
    });
}
function togglePanel(panelId) {
    var panel = document.getElementById(panelId);
    if (!panel) return;

    var btn = panel.querySelector('.toggle-btn');
    panel.classList.toggle('hidden');
    if (panelId === 'left-panel') {
        var isHidden = panel.classList.contains('hidden');
        if (btn) btn.innerText = isHidden ? '▶' : '◀';

        var homeBtn = document.getElementById('home-btn');
        if (homeBtn) homeBtn.style.left = isHidden ? '20px' : '350px';

    } else if (panelId === 'info-panel') {
        var isHidden = panel.classList.contains('hidden');
        if (btn) btn.innerText = isHidden ? '◀' : '▶';
    }

    setTimeout(function() {
        if (map) map.invalidateSize();
    }, 400);
}
// --- 3. 初期化 ＆ 地点管理 ---
window.onload = function() {

    // --- 1. マップの初期設定 ---
    if (typeof L !== 'undefined') {
        map = L.map('map').setView(locations.origin.latlng, 8);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        locations.origin.marker = createMarker(locations.origin, 'blue');
        locations.dest.marker = createMarker(locations.dest, 'blue');

        map.on('click', function(e) {
            if (typeof addNewWaypoint === 'function') addNewWaypoint(e.latlng);
        });
    }

    // --- 2. 日付の初期値を設定 ---
    var startDateInput = document.getElementById('start-date');
    if (startDateInput && !startDateInput.value) {
        startDateInput.valueAsDate = new Date();
    }

    // --- 3. DBデータの復元 ---
    if (typeof jspConfig !== 'undefined') {

        console.log("🛠️ DBデータを復元します:", jspConfig);

        if (jspConfig.savedCosts && typeof restoreExpenses === 'function') {
            restoreExpenses(jspConfig.savedCosts);
        }

        if (jspConfig.savedWaypoints && jspConfig.savedWaypoints.length > 0) {
            console.log("📍 経由地を再描画します");
            jspConfig.savedWaypoints.forEach(function(wp) {
                if (typeof addWaypointFromData === 'function') {
                    addWaypointFromData(wp);
                }
            });
        }

        updateGrandTotal();
    }
};

function createMarker(locObj, color) {
    return L.marker(locObj.latlng, {
        draggable: true,
        icon: L.divIcon({
            html: '<span style="color:red; font-size:24px;">📍</span>',
            className: 'marker-icon',
            iconSize: [30, 30]
        })
    }).addTo(map);
}
// データの復元処理のイメージ
function restoreWaypoints() {
    var items = document.querySelectorAll('#restore-data .wp-item');
    items.forEach(item => {
        var data = {
            name: item.querySelector('.name').innerText,
            lat: parseFloat(item.querySelector('.lat').innerText),
            lng: parseFloat(item.querySelector('.lng').innerText),
            isReturn: item.querySelector('.is-return').innerText === "1",
            stayTime: item.querySelector('.stay-time').innerText, // ★追加
            description: item.querySelector('.description').innerText // ★追加
        };

        // マーカーを立てる処理...
        // 入力フォームを作成し、値をセットする
        var inputDesc = document.querySelector('.some-desc-input'); // 実際クラス名に合わせてください
        if (inputDesc) inputDesc.value = data.description;

        var inputStay = document.querySelector('.some-stay-input');
        if (inputStay) inputStay.value = data.stayTime;
    });
}
function clearAllMarkers() {
    // 1. 中継地のピンを消す（行き）
    waypoints.forEach(function(wp) {
        if (wp.marker) map.removeLayer(wp.marker);
    });
    // 2. 中継地のピンを消す（帰り）
    returnWaypoints.forEach(function(wp) {
        if (wp.marker) map.removeLayer(wp.marker);
    });
    // 3. 出発地・目的地のピンを消す
    if (locations.origin.marker) map.removeLayer(locations.origin.marker);
    if (locations.dest.marker) map.removeLayer(locations.dest.marker);

    // 4. ルートの線を消す
    if (routeLayer) map.removeLayer(routeLayer);
}
// 引数に name を追加し、初期値を null にしておく
// 第3引数に stayTime を追加し、初期値を 0 にする
// 引数に isReturn = false (デフォルトは行き) を追加
function addNewWaypoint(latlng, name = null, stayTime = 0, isReturn = false) {
    var id = 'wp_' + Date.now() + Math.random().toString(36).substring(7);
    
    // 座標取得
    var lat = latlng.lat !== undefined ? latlng.lat : (Array.isArray(latlng) ? latlng[0] : latlng.lat);
    var lng = latlng.lng !== undefined ? latlng.lng : (Array.isArray(latlng) ? latlng[1] : latlng.lng);
    var initialLatlng = [lat, lng];

    var wpObj = {
        id: id,
        name: name ? name : "経由地 " + (waypoints.length + returnWaypoints.length + 1),
        lat: lat,
        lng: lng,
        latlng: initialLatlng,
        stayTime: stayTime
    };

    // 🔴【超重要】getRoute を変えないための仕掛け
    if (isReturnTrip) {
        // 復路の場合：returnWaypointsに追加
        returnWaypoints.push(wpObj);
        // getRouteが「waypoints」しか見ないので、一時的に中身をすり替えるか、
        // getRoute実行時だけ waypoints を returnWaypoints と同じにする
        window.waypoints = returnWaypoints; 
    } else {
        // 往路の場合
        waypoints.push(wpObj);
    }

    // 🔴 ピンを表示
    wpObj.marker = createMarker(wpObj, 'red');

    // 住所更新
    if (!name) {
        if (typeof updateLocationData === 'function') {
            updateLocationData(id, { lat: lat, lng: lng });
        }
    }

    renderWaypointList();

    // 🔴 getRouteを実行（これで線が引かれる）
    if (typeof getRoute === 'function') {
        getRoute();
    }
}// 「帰り」の地点を追加するための専用関数
function addReturnWaypoint(latlng, name = null, stayTime = 0) {

    // 既存の addNewWaypoint とほぼ同じですが、入れる配列を returnWaypoints にします
    var id = 'wp_' + Date.now() + Math.random().toString(36).substring(7);
    var initialLatlng = latlng ? [latlng.lat, latlng.lng] : [map.getCenter().lat, map.getCenter().lng];

    var wpName = name ? name : "取得中...";

    var wpObj = {
        id: id,
        name: wpName,
        latlng: initialLatlng,
        stayTime: stayTime
    };

    // ★ここがポイント：returnWaypoints に push する！
    wpObj.marker = createMarker(wpObj, 'orange'); // 帰りは色を変えると分かりやすい（例：オレンジ）
    returnWaypoints.push(wpObj);

    if (!name) {
        updateLocationData(id, { lat: initialLatlng[0], lng: initialLatlng[1] });
    }

    renderWaypointList(); // リストを再描画
    console.log("★ returnWaypoints:", JSON.stringify(returnWaypoints, null, 2));


}
function renderWaypointList() {
    // --- 往路（行き）の描画 ---
    var container = document.getElementById('waypoint-list-container');
    if (container) {
        container.innerHTML = "";
        waypoints.forEach(function(wp) {
            // IDがない場合のバックアップ処理（重要）
            if (!wp.id) { wp.id = "wp_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5); }

            var div = document.createElement('div');
            div.className = 'waypoint-item';
            div.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<span style="font-weight:bold;">往：📍 ' + wp.name + '</span>' +
                // 引用符のエラーを防ぐため ID を String で確実に囲む
                '<button type="button" class="remove-btn" onclick="removeWaypoint(\'' + String(wp.id) + '\', false)">削除</button></div>' +
                '<div style="margin-top:5px; font-size:0.85em; color:#666;">' +
                '⏱ 滞在：<input type="number" class="stay-time-input" style="width:50px;" value="' + (wp.stayTime || 0) + '" oninput="updateStayTime(\'' + wp.id + '\', this.value); updateTimeline();"> 分' +
                '</div>';
            container.appendChild(div);

            // マーカー再描画処理
            if (wp.latlng && map) {
                if (wp.marker) map.removeLayer(wp.marker);
                if (typeof createMarker === 'function') {
                    wp.marker = createMarker(wp, 'red');
                }
            }
        });
    }

    // --- 復路（帰り）の描画 ---
    var returnContainer = document.getElementById('return-waypoint-list-container');
    if (returnContainer) {
        returnContainer.innerHTML = "";
        returnWaypoints.forEach(function(wp) {
            if (!wp.id) { wp.id = "ret_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5); }

            var div = document.createElement('div');
            div.className = 'waypoint-item';
            div.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<span style="font-weight:bold; color:#e67e22;">復：📍 ' + wp.name + '</span>' +
                '<button type="button" class="remove-btn" onclick="removeWaypoint(\'' + String(wp.id) + '\', true)">削除</button></div>' +
                '<div style="margin-top:5px; font-size:0.85em; color:#666;">' +
                '⏱ 滞在：<input type="number" class="stay-time-input" style="width:50px;" value="' + (wp.stayTime || 0) + '" oninput="updateStayTime(\'' + wp.id + '\', this.value); updateTimeline();"> 分' +
                '</div>';
            returnContainer.appendChild(div);

            if (wp.latlng && map) {
                if (wp.marker) map.removeLayer(wp.marker);
                if (typeof createMarker === 'function') {
                    wp.marker = createMarker(wp, 'red');
                }
            }
        });
    }
}
function updateLocationData(id, latlng) {
    var target = (id === 'origin') ? locations.origin :
        (id === 'dest') ? locations.dest :
            (waypoints.find(w => w.id === id) || returnWaypoints.find(w => w.id === id));
    if (!target) return;

    target.latlng = [latlng.lat, latlng.lng];
    if (target.marker) target.marker.setLatLng(latlng);

    clearTimeout(geocodeTimer);
    geocodeTimer = setTimeout(function() {
        // ★ここをサーブレット経由に書き換えました
        fetch('TripServlet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=getAddress&lat=' + latlng.lat + '&lon=' + latlng.lng
        })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data && data.address) {
                    target.name = data.address.city || data.address.town || data.address.suburb || data.address.neighbourhood || "指定地点";
                }
                if (id === 'origin' && document.getElementById('origin-input')) {
                    document.getElementById('origin-input').value = target.name;
                }
                if (id === 'dest' && document.getElementById('dest-input')) {
                    document.getElementById('dest-input').value = target.name;
                }
                getRoute();
            })
            .catch(function(e) {
                console.warn("住所取得失敗", e);
                getRoute();
            });
    }, 800);
}
// --- 4. ルート・予算計算 ---
// --- 往路・復路の距離と時間を保持する変数 ---
var outboundDistanceKm = 0;
var outboundDurationText = "";
var returnDistanceKm = 0;
var returnDurationText = "";

// --- 共通の最新値（UI表示用） ---
var totalDistanceKm = 0;
var totalDurationText = "";

function getRoute() {
    
	console.log("--- getRoute開始 ---");
	console.trace("🔎 getRouteが呼ばれました。呼び出し元はこちら：");
	
    return new Promise(function(resolve, reject) {



        var coordsArr = [];
        if (locations.origin && locations.origin.latlng) coordsArr.push(locations.origin.latlng);

        var activeWaypoints = waypoints;
        if (activeWaypoints && activeWaypoints.length > 0) {
            activeWaypoints.forEach(function(w) {
                if (w.latlng) coordsArr.push(w.latlng);
            });
        }

        if (locations.dest && locations.dest.latlng) coordsArr.push(locations.dest.latlng);

        if (coordsArr.length < 2) {
            resolve();
            return;
        }

        var coordsStr = coordsArr.map(function(c) {
            return c[1] + ',' + c[0];
        }).join(';');
		console.log("📡 送信される座標の数:", coordsArr.length);
		console.log("🚚 座標の中身:", coordsStr);
        var url = "https://router.project-osrm.org/route/v1/driving/" + coordsStr +
            "?overview=full&geometries=geojson&steps=true";

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.code === 'Ok') {
                    var rt = data.routes[0];
                    routeLegs = rt.legs;

                    // --- 距離・時間の計算 ---
                    var distanceKm = (rt.distance / 1000).toFixed(1);
                    var h = Math.floor(rt.duration / 3600);
                    var m = Math.floor((rt.duration % 3600) / 60);
                    var durationText = (h > 0 ? h + "時間 " : "") + m + "分";

                    // --- 共通の最新値 ---
                    totalDistanceKm = parseFloat(distanceKm);
                    totalDurationText = durationText;

                    // --- 往路・復路に振り分け ---
                    if (isReturnTrip) {
                        returnDistanceKm = totalDistanceKm;
                        returnDurationText = totalDurationText;
                    } else {
                        outboundDistanceKm = totalDistanceKm;
                        outboundDurationText = totalDurationText;
                    }

                    // --- UI 更新 ---
                    document.getElementById('disp-distance').innerText = distanceKm + " km";
                    document.getElementById('disp-time').innerText = durationText;

                    if (routeLayer) map.removeLayer(routeLayer);
                    routeLayer = L.polyline(rt.geometry.coordinates.map(function(c) {
                        return [c[1], c[0]];
                    }), { color: '#4a90e2', weight: 5, opacity: 0.7 }).addTo(map);
                    
                    calcTotal();
                    updateTimeline();
                    renderFullNav();
                }
                resolve();
            })
            .catch(e => {
                console.error("ルート取得エラー", e);
                reject(e);
            });
    });
}
/*function drawRouteBuleLineOnly(rt) {
    if (!rt || !rt.geometry || !rt.geometry.coordinates) return;

    // 既存の青線を消す
    if (routeLayer) map.removeLayer(routeLayer);

    // 青線を描く
    routeLayer = L.polyline(
        rt.geometry.coordinates.map(c => [c[1], c[0]]),
        { color: '#4a90e2', weight: 5, opacity: 0.7 }
    ).addTo(map);
}*/

function renderFullNav() {
    if (currentRightTab !== 'nav') return;
    var container = document.getElementById('right-panel-content');
    if (!container) return;

    var all = [{ l: "🚩出発", d: locations.origin }].concat(
        waypoints.map(function(w, i) { return { l: '📍経由' + (i + 1), d: w }; }),
        [{ l: "🏁目的", d: locations.dest }]
    );

    var html = "";
    all.forEach(function(s) {
        var la = s.d.latlng[0], lo = s.d.latlng[1];
        var n = s.d.name;

        // --- カードの開始 ---
        html += '<div style="background:#fff; border:1px solid #ffe4b5; border-radius:10px; padding:12px; margin-bottom:20px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">' +
            '<div style="font-weight:bold; color:#d4a017; font-size:1.1em; border-bottom:2px solid #fff4e5; padding-bottom:5px; margin-bottom:10px;">' + s.l + ': ' + n + '</div>' +

            // 1. 基本検索ボタン
            '<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px; margin-bottom:10px;">' +
            '<div class="spot-btn-mini" onclick="gSearch(\'病院\',' + la + ',' + lo + ')">🏥病院</div>' +
            '<div class="spot-btn-mini" onclick="gSearch(\'犬 同伴 レストラン\',' + la + ',' + lo + ')">🍖犬OK</div>' +
            '<div class="spot-btn-mini" onclick="gSearch(\'天気\',' + la + ',' + lo + ')">☀️天気</div>' +
            '<div class="spot-btn-mini" onclick="gSearch(\'駐車場 予約\',' + la + ',' + lo + ')">🅿️予約</div>' +
            '<div class="spot-btn-mini" onclick="gSearch(\'休憩スポット\',' + la + ',' + lo + ')">☕休憩</div>' +
            '<div class="spot-btn-mini" onclick="gSearch(\'混雑状況\',' + la + ',' + lo + ')">📱混雑</div>' +
            '</div>' +

            // 2. 人気＆トレンド
            '<div style="font-size:0.85em; font-weight:bold; color:#666; margin:10px 0 5px;">🔥 ' + n + 'の人気＆トレンド</div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:5px; margin-bottom:10px;">' +
            '<div class="spot-btn-mini" onclick="gSearch(\'人気スポット TOP10\',' + la + ',' + lo + ')">🏆人気10</div>' +
            '<div class="spot-btn-mini" onclick="gSearch(\'インスタ映え\',' + la + ',' + lo + ')">📸映え</div>' +
            '<div class="spot-btn-mini" onclick="gSearch(\'話題のグルメ\',' + la + ',' + lo + ')">🍴話題</div>' +
            '<div class="spot-btn-mini" onclick="gSearch(\'流行りのこと\',' + la + ',' + lo + ')">🔥流行</div>' +
            '</div>' +

            // 3. その他（★ここが途切れていた箇所★）
            '<div style="font-size:0.85em; font-weight:bold; color:#666; margin:10px 0 5px;">✨ その他</div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px;">' +
            '<div class="spot-btn-mini" style="color:red;" onclick="gSearch(\'近くの動物病院\',' + la + ',' + lo + ')">🚨動物病院</div>' +
            '<div class="spot-btn-mini" onclick="gSearch(\'近くのコンビニ\',' + la + ',' + lo + ')">🏪コンビニ</div>' +
            '<div class="spot-btn-mini" onclick="gSearch(\'近くのドッグラン\',' + la + ',' + lo + ')">🐾ラン</div>' +
            '<div class="spot-btn-mini" onclick="gSearch(\'近くの駐車場\',' + la + ',' + lo + ')">🅿️駐車場</div>' +
            '<div class="spot-btn-mini" onclick="gSearch(\'近くのガソリンスタンド\',' + la + ',' + lo + ')">⛽給油</div>' +
            '<div class="spot-btn-mini" onclick="gSearch(\'近くの薬局\',' + la + ',' + lo + ')">💊薬局</div>' +
            '<div class="spot-btn-mini" onclick="gSearch(\'近くの道の駅\',' + la + ',' + lo + ')">🍦道の駅</div>' +
            '<div class="spot-btn-mini" onclick="gSearch(\'高評価 カフェ\',' + la + ',' + lo + ')">🍰カフェ</div>' +
            '<div class="spot-btn-mini" onclick="gSearch(\'絶景 夜景\',' + la + ',' + lo + ')">✨絶景</div>' +
            '<div class="spot-btn-mini" onclick="gSearch(\'スーパー 買い出し\',' + la + ',' + lo + ')">🛍️買い出</div>' +
            '</div>' + // その他ボタンエリア閉じ
            '</div>';   // カード全体閉じ
    });

    container.innerHTML = html;

    // CSSを動的に追加（ボタンの見た目用）
    if (!document.getElementById('custom-nav-css')) {
        var style = document.createElement('style');
        style.id = 'custom-nav-css';
        style.innerHTML = ".spot-btn-mini { background:#f9f9f9; border:1px solid #ddd; border-radius:4px; padding:4px; text-align:center; font-size:0.75em; cursor:pointer; transition:0.2s; } .spot-btn-mini:hover { background:#fff4e5; border-color:#ffd700; }";
        document.head.appendChild(style);
    }
} // --- 以下、補助機能 ---
function gSearch(k, la, lo) { window.open('https://www.google.com/maps/search/' + encodeURIComponent(k) + '/@' + la + ',' + lo + ',14z', '_blank'); }

function switchRightTab(tab) {
    currentRightTab = tab;
    var btns = document.querySelectorAll('.tab-btn');
    if (btns.length >= 2) {
        btns[0].classList.toggle('active', tab === 'nav');
        btns[1].classList.toggle('active', tab === 'timeline');
    }
    var container = document.getElementById('right-panel-content');
    if (container) {
        container.innerHTML = ""; // 一旦、中身を真っ白にする（壊れ防止）

        if (tab === 'nav') {
            renderFullNav();  // 周辺ナビの描画
        } else {
            updateTimeline(); // 時間割の描画
        }
    }
}
function addMainMarkers() {
    // 出発地ピン
    if (locations.origin.latlng) {
        locations.origin.marker = L.marker(locations.origin.latlng, {
            draggable: true,
            icon: L.divIcon({ html: '🚩', className: 'marker-icon', iconSize: [30, 30] })
        }).addTo(map).on('dragend', function(e) {
            updateLocationData('origin', e.target.getLatLng());
        });
    }
    // 目的地ピン
    if (locations.dest.latlng) {
        locations.dest.marker = L.marker(locations.dest.latlng, {
            draggable: true,
            icon: L.divIcon({ html: '🏁', className: 'marker-icon', iconSize: [30, 30] })
        }).addTo(map).on('dragend', function(e) {
            updateLocationData('dest', e.target.getLatLng());
        });
    }
}
function addEventPrompt(pointId) {
    var task = prompt("予定を入力", "ランチ");
    var dur = prompt("時間(分)", "60");
    if (task && dur) {
        if (!customEvents[pointId]) customEvents[pointId] = [];
        customEvents[pointId].push({ task: task, dur: parseInt(dur) || 30 });
        updateTimeline();
    }
}

function removeEvent(pointId, index) {
    if (customEvents[pointId]) { customEvents[pointId].splice(index, 1); updateTimeline(); }
}
function calcTotal() {
    // 1. まず最新の入力値をデータ（変数）に保存する
	console.log("--- calctotal開始 ---");
    saveExp();

    // 2. ガソリン代と高速代を計算
    calcGasCost();
    calcHighwayCost();

    // 3. 宿泊費・食費・その他の合計を出す
    var currentExp = isReturnTrip ? jspreturnExpenses : jspoutboundExpenses;
    var hotelSum = 0, foodSum = 0, otherSum = 0;

    currentExp.hotel.forEach(item => hotelSum += item.price);
    currentExp.food.forEach(item => foodSum += item.price);
    currentExp.other.forEach(item => otherSum += item.price);

    var expenseSum = hotelSum + foodSum + otherSum;

    // 4. 総計
    var total = gasCost + highwayCost + expenseSum;

    // 5. 画面表示の更新
    document.getElementById('disp-total').innerText = "¥" + total.toLocaleString();
    updateGrandTotal(); // ★これを追加！
    document.getElementById('disp-gas').innerText = "¥" + gasCost.toLocaleString();
    document.getElementById('disp-highway').innerText = "¥" + highwayCost.toLocaleString();
    document.getElementById('disp-hotel').innerText = "¥" + hotelSum.toLocaleString();
    document.getElementById('disp-food').innerText = "¥" + foodSum.toLocaleString();
    document.getElementById('disp-other').innerText = "¥" + otherSum.toLocaleString();
}
function addInputRow(cId, label) {
    var div = document.createElement('div');
    div.className = 'dynamic-input-row';
    // oninput で calcTotal と saveExp を両方呼ぶように修正
    div.innerHTML = '<input type="text" value="' + label + '" oninput="saveExp()">' +
        '<input type="number" class="' + cId.split('-')[0] + '-price" value="0" oninput="saveExp(); calcTotal()">';
    document.getElementById(cId).appendChild(div);
}

function getAllWeather() {
    var div = document.getElementById('weather-container');
    var d = document.getElementById('start-date').value;
    if (!d || !div) return;
    div.innerHTML = "📡 取得中...";
    var ps = [{ n: locations.origin.name, la: locations.origin.latlng[0], lo: locations.origin.latlng[1] }].concat(
        waypoints.map(function(w) { return { n: w.name, la: w.latlng[0], lo: w.latlng[1] }; }),
        [{ n: locations.dest.name, la: locations.dest.latlng[0], lo: locations.dest.latlng[1] }]
    );

    // 天気コードを絵文字に変換する辞書
    var getWeatherIcon = function(code) {
        if (code <= 1) return "☀️"; // 晴れ
        if (code <= 3) return "☁️"; // 曇り
        if (code <= 48) return "🌫️"; // 霧
        if (code <= 67) return "☔"; // 雨
        if (code <= 77) return "❄️"; // 雪
        if (code <= 82) return "🌦️"; // 俄か雨
        if (code <= 99) return "⚡"; // 雷
        return "❓";
    };

    var promises = ps.map(function(p) {
        // weathercodeも取得するようにURLを指定
        var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + p.la + '&longitude=' + p.lo + '&hourly=temperature_2m,weathercode&start_date=' + d + '&end_date=' + d + '&timezone=Asia%2FTokyo';
        return fetch(url).then(function(res) { return res.json(); }).then(function(data) {
            var temp = data.hourly.temperature_2m[12]; // 12時の気温
            var code = data.hourly.weathercode[12];    // 12時の天気コード
            var icon = getWeatherIcon(code);
            var detailUrl = 'https://www.google.com/search?q=' + encodeURIComponent(p.n + ' 天気');

            return p.n + ': ' + icon + ' ' + temp + '℃ <a href="' + detailUrl + '" target="_blank" style="color:blue; text-decoration:underline; font-size:0.8em;">[詳細]</a><br>';
        }).catch(function() { return p.n + ': エラー<br>'; });
    });

    Promise.all(promises).then(function(results) {
        div.innerHTML = '🗓️ ' + d + ' 予報<br>' + results.join('');
    });
}

function removeWaypoint(id, isReturn) {
    console.log("🗑️ 削除実行: ID=" + id + " 復路=" + isReturn);

    // 1. 対象の配列を決定
    var targetArray = isReturn ? returnWaypoints : waypoints;
    var idx = -1;

    // 2. IDで検索（型の違いを考慮して String に変換して比較）
    for (var i = 0; i < targetArray.length; i++) {
        if (String(targetArray[i].id) === String(id)) {
            idx = i;
            break;
        }
    }

    // 3. もしIDで見つからなかった場合の「最終手段」（名前と座標で照合）
    if (idx === -1) {
        console.log("⚠️ ID一致なし。予備検索を開始します...");
        for (var j = 0; j < targetArray.length; j++) {
            // IDがない場合や、IDの不整合がある場合に名前等で特定
            if (targetArray[j].name === id) { 
                idx = j;
                break;
            }
        }
    }

    // 4. 見つかった場合の削除処理
    if (idx !== -1) {
        // 地図上のマーカーを消去
        if (targetArray[idx].marker) {
            map.removeLayer(targetArray[idx].marker);
        }

        // 配列から削除
        targetArray.splice(idx, 1);
        console.log("✅ 削除しました。残り件数:", targetArray.length);

        // 5. 画面更新とルート再計算（ここを忘れると消えたように見えない）
        renderWaypointList();
        if (typeof getRoute === 'function') {
            getRoute();
        }
    } else {
        console.error("❌ 削除対象が見つかりませんでした (ID mismatch)");
    }
}

// --- 1. 【新しく追加】現在の入力欄の予算をバックアップする関数 ---

function updateModeDisplay() {
    var badge = document.getElementById('mode-badge');
    if (!badge) return;
    if (isReturnTrip) {
        badge.innerText = "🏠 復路（帰り）を編集中";
        badge.className = "badge-return";
    } else {
        badge.innerText = "✈️ 往路（行き）を編集中";
        badge.className = "badge-outbound";
    }
}
function saveFullPlan() {
    console.log("saveFullPlan開始");

    getRoute().then(() => {
        calcGasCost();
        calcHighwayCost();
        calcTotal();
        saveExp();

        // --- 【ここから修正：予定（description）の同期】 ---
        // 1. まず現在の画面にある description 入力欄から、現在の waypoints 配列へ文字を回収
        waypoints.forEach(wp => {
            const input = document.querySelector(`.desc-input[data-id="${wp.id}"]`) || 
                          document.getElementById(`desc-${wp.id}`);
            if (input) {
                wp.description = input.value; // 変数に最新の「ランチ」などを書き込む
            }
        });

        // 2. 現在の表示モードに合わせて「最新の状態」をそれぞれの変数にバックアップ
        if (isReturnTrip) {
            returnWaypoints = JSON.parse(JSON.stringify(extractPureData(waypoints)));
            returnEvents = JSON.parse(JSON.stringify(customEvents));
        } else {
            outboundWaypoints = JSON.parse(JSON.stringify(extractPureData(waypoints)));
            outboundEvents = JSON.parse(JSON.stringify(customEvents));
        }
        // --- 【修正ここまで】 ---

        var totalAll = Number(
            document.getElementById('grand-total-display')
                .innerText.replace(/[^0-9]/g, '')
        );

        // --- 【最強の固定ロジック】座標・名称判定 ---
        let finalOriginName, finalDestName;
        let finalOriginLat, finalOriginLng, finalDestLat, finalDestLng;
        const currentOriginText = document.getElementById('origin-input').value;
        const currentDestText   = document.getElementById('dest-input').value;
        const isCurrentlyReversed = Math.abs(locations.origin.latlng[0] - jspConfig.destLat) < 0.01;

        if (isReturnTrip || isCurrentlyReversed) {
            console.log("🔄 復路表示中：往路順で保存します");
            finalOriginName = currentDestText;   
            finalDestName   = currentOriginText; 
            finalOriginLat = locations.dest.latlng[0];
            finalOriginLng = locations.dest.latlng[1];
            finalDestLat   = locations.origin.latlng[0];
            finalDestLng   = locations.origin.latlng[1];
        } else {
            console.log("🚩 往路表示中：そのまま保存します");
            finalOriginName = currentOriginText;
            finalDestName   = currentDestText;
            finalOriginLat = locations.origin.latlng[0];
            finalOriginLng = locations.origin.latlng[1];
            finalDestLat   = locations.dest.latlng[0];
            finalDestLng   = locations.dest.latlng[1];
        }

        // 送信データの作成
        var fullPlanData = {
            originName: finalOriginName, 
            destName:   finalDestName,   
            startDate:  document.getElementById('start-date').value,
            totalBudget: totalAll,
            originLat: finalOriginLat,
            originLng: finalOriginLng,
            destLat:   finalDestLat,
            destLng:   finalDestLng,

            outbound: {
                fuelCost: jspoutboundExpenses.gas || 0,
                highwayCost: jspoutboundExpenses.highway || 0,
                distanceKm: outboundDistanceKm,
                durationText: outboundDurationText,
                waypoints: (outboundWaypoints || []).map(wp => ({
                    name: wp.name,
                    lat: wp.latlng[0],
                    lng: wp.latlng[1],
                    stayTime: wp.stayTime || 0,
                    description: wp.description || "", // ★ ここに値が入っていることを保証
                    details: outboundEvents[wp.id] || []
                })),
                expenses: jspoutboundExpenses
            },

            return: {
                fuelCost: jspreturnExpenses.gas || 0,
                highwayCost: jspreturnExpenses.highway || 0,
                distanceKm: returnDistanceKm,
                durationText: returnDurationText,
                waypoints: (returnWaypoints || []).map(wp => ({
                    name: wp.name,
                    lat: wp.latlng[0],
                    lng: wp.latlng[1],
                    stayTime: wp.stayTime || 0,
                    description: wp.description || "", // ★ 帰路も同期された値を使う
                    details: returnEvents[wp.id] || []
                })),
                expenses: jspreturnExpenses
            }
        };

        console.log("📤 送信直前の全データ:", fullPlanData);

        fetch("SaveFullPlanServlet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fullPlanData)
        })
            .then(res => res.ok ? alert("旅の計画を保存しました！") : alert("保存に失敗しました"))
            .catch(e => console.error("Save Error:", e));
    });
}
function extractPureData(wpArray) {
    return wpArray.map(wp => ({
        id: wp.id,
        name: wp.name,
        latlng: wp.latlng,
        stayTime: wp.stayTime
    }));
}
function updateTotalCost() {
    var currentTripCost = 0;
    var totalText = document.getElementById('disp-total').innerText;
    currentTripCost = parseInt(totalText.replace(/[¥,]/g, '')) || 0;
    var totalAll = currentTripCost + outboundFinalCost;
    var totalEl = document.getElementById('total-amount');
    if (totalEl) {
        totalEl.innerText = totalAll.toLocaleString();
    }
}
function renderWaypointList() {
    // --- 往路（行き）の描画 ---
    var container = document.getElementById('waypoint-list-container');
    if (container) {
        container.innerHTML = "";
        waypoints.forEach(function(wp) {
            // 1. リスト要素の作成
            var div = document.createElement('div');
            div.className = 'waypoint-item';
            div.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<span style="font-weight:bold;">往：📍 ' + wp.name + '</span>' +
                '<button type="button" class="remove-btn" onclick="removeWaypoint(\'' + wp.id + '\', false)">削除</button></div>' + // ←ここをプラスに変更！
                '<div style="margin-top:5px; font-size:0.85em; color:#666;">' +
                '⏱ 滞在：<input type="number" class="stay-time-input" style="width:50px;" value="' + (wp.stayTime || 0) + '" oninput="updateStayTime(\'' + wp.id + '\', this.value); updateTimeline();"> 分' +
                '</div>';
            container.appendChild(div);

            // 2. 地図へのピン再描画（★ここが重要！）
            if (wp.latlng && !isReturnTrip) { // 行きモードの時だけ表示
                if (wp.marker) map.removeLayer(wp.marker); // 古いのがあれば消す
                wp.marker = L.marker(wp.latlng, {
                    icon: L.divIcon({ html: '📍', className: 'marker-icon', iconSize: [30, 30] })
                }).addTo(map);
            }
        });
    }

    // --- 復路（帰り）の描画 ---
    var returnContainer = document.getElementById('return-waypoint-list-container');
    if (returnContainer) {
        returnContainer.innerHTML = "";
        returnWaypoints.forEach(function(wp) {
            // 1. リスト要素の作成
            var div = document.createElement('div');
            div.className = 'waypoint-item';
            div.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<span style="font-weight:bold; color:#e67e22;">復：📍 ' + wp.name + '</span>' +
                '<button type="button" class="remove-btn" onclick="removeWaypoint(\'' + wp.id + '\', true)">削除</button></div>' + // ←ここをプラスに変更！
                '<div style="margin-top:5px; font-size:0.85em; color:#666;">' +
                '⏱ 滞在：<input type="number" class="stay-time-input" style="width:50px;" value="' + (wp.stayTime || 0) + '" oninput="updateStayTime(\'' + wp.id + '\', this.value); updateTimeline();"> 分' +
                '</div>';
            returnContainer.appendChild(div);

            // 2. 地図へのピン再描画（★ここが重要！）
            if (wp.latlng && isReturnTrip) { // 帰りモードの時だけ表示
                if (wp.marker) map.removeLayer(wp.marker); // 古いのがあれば消す
                wp.marker = L.marker(wp.latlng, {
                    icon: L.divIcon({ html: '📍', className: 'marker-icon', iconSize: [30, 30] })
                }).addTo(map);
            }
        });
    }
}

function setAmount(containerId, amount, label) {
    var container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = ""; // 初期値を消す
    var type = containerId.replace('-container', '');
    var div = document.createElement('div');
    div.className = 'dynamic-input-row';
    div.innerHTML =
        '<input type="text" value="' + label + '">' +
        '<input type="number" class="' + type + '-price" value="' + amount + '" oninput="calcTotal()">';
    container.appendChild(div);
}

function setCostValue(className, value) {
    var el = document.querySelector('.' + className);
    if (el) {
        el.value = value;
        calcTotal();
    }
}
// ==========================================
// 1. 予算の入力内容を保存する (saveExp)
// ==========================================
function saveExp() {
	console.log("--- saveexp開始 ---");
    var summary = { hotel: [], food: [], other: [], gas: gasCost, highway: highwayCost };

    ['hotel', 'food', 'other'].forEach(function(type) {
        var container = document.getElementById(type + '-container');
        if (container) {
            var rows = container.querySelectorAll('.dynamic-input-row');
            rows.forEach(function(row) {
                var inputs = row.querySelectorAll('input');
                var label = inputs[0].value;
                var price = parseInt(inputs[1].value) || 0;
                summary[type].push({ label: label, price: price });
            });
        }
    });

    if (isReturnTrip) {
        jspreturnExpenses = summary;
    } else {
        jspoutboundExpenses = summary;
    }
}
function reverseRoute() {

    console.log("🔄 モード切り替えを開始します");

    // --- 1. まず現在の地図上のピンと線をすべて物理的に消去する ---
    if (typeof map !== 'undefined') {

        // 経由地マーカーを消す
        waypoints.forEach(w => { if (w.marker) map.removeLayer(w.marker); });
        outboundWaypoints.forEach(w => { if (w.marker) map.removeLayer(w.marker); });
        returnWaypoints.forEach(w => { if (w.marker) map.removeLayer(w.marker); });

        // 出発地・目的地のマーカーを消す
        if (locations.origin.marker) map.removeLayer(locations.origin.marker);
        if (locations.dest.marker) map.removeLayer(locations.dest.marker);

        // ルート線を消す
        if (routeLayer) map.removeLayer(routeLayer);
    }

    // --- 安全装置 ---
    if (typeof waypoints === 'undefined') waypoints = [];
    if (typeof returnWaypoints === 'undefined') returnWaypoints = [];
    if (typeof customEvents === 'undefined') customEvents = {};

    // --- 2. 現在の入力を保存 ---
    try {
        saveExp();
    } catch (e) {
        console.warn("保存中にエラーが発生しましたが続行します:", e);
    }

    // --- 3. データの入れ替え（往復ロジック） ---
    if (!isReturnTrip) {
        // 【行き → 帰り】
        var totalEl = document.getElementById('disp-total');
        outboundFinalCost = totalEl ? (parseInt(totalEl.innerText.replace(/[¥,]/g, '')) || 0) : 0;

        outboundWaypoints = [...waypoints];
        outboundEvents = JSON.parse(JSON.stringify(customEvents));

        isReturnTrip = true;

        waypoints = [...returnWaypoints];
        customEvents = JSON.parse(JSON.stringify(returnEvents || {}));
        restoreExpenses(jspreturnExpenses);

    } else {
        // 【帰り → 行き】
        returnWaypoints = [...waypoints];
        returnEvents = JSON.parse(JSON.stringify(customEvents));

        outboundFinalCost = 0;
        isReturnTrip = false;

        waypoints = [...outboundWaypoints];
        customEvents = JSON.parse(JSON.stringify(outboundEvents || {}));
        restoreExpenses(jspoutboundExpenses);
    }

    // --- 4. 出発・目的地の論理入れ替え（★値コピーで入れ替える） ---
    if (locations.origin && locations.dest) {

        // ★参照コピー禁止 → 値コピーに修正
        var tempLatlng = [...locations.origin.latlng];
        var tempName = locations.origin.name;

        locations.origin.latlng = [...locations.dest.latlng];
        locations.origin.name = locations.dest.name;

        locations.dest.latlng = tempLatlng;
        locations.dest.name = tempName;

        // UI（テキスト入力欄）の同期
        var oIn = document.getElementById('origin-input');
        var dIn = document.getElementById('dest-input');
        if (oIn && dIn) {
            oIn.value = locations.origin.name;
            dIn.value = locations.dest.name;
        }
    }

    // --- 5. 地図への再描画（ここで新しいピンが立つ） ---
    if (typeof addMainMarkers === 'function') {
        addMainMarkers();
    } else {
        L.marker(locations.origin.latlng).addTo(map);
        L.marker(locations.dest.latlng).addTo(map);
    }

    // 経由地リストとピンの再描画
    if (typeof renderWaypointList === 'function') renderWaypointList();

    // --- ★ルート描画はピン再配置が完全に終わってから ---
    setTimeout(() => {
        if (typeof getRoute === 'function') getRoute();
    }, 200);

    if (typeof updateModeDisplay === 'function') updateModeDisplay();
    // ★ ここに貼り付け ★
    if (typeof autoFillExpenseFields === 'function') {
        autoFillExpenseFields(window.savedExpenses || savedExpenses);
    }
    updateGrandTotal();
    // モード切替に合わせて金額を再セットする命令
    if (typeof autoFillExpenseFields === 'function') {
        autoFillExpenseFields(window.savedExpenses || savedExpenses);
    }

    console.log("✅ 全ピンの消去と再配置が完了しました");
}

function toggleReverseArea() {
    var checkbox = document.getElementById('reverse-mode');
    var area = document.getElementById('target-time-area');
    if (checkbox && area) {
        area.style.display = checkbox.checked ? 'block' : 'none';
    }
    // 切り替え時にタイムラインも再計算する
    if (typeof updateTimeline === 'function') updateTimeline();
}
function addMainMarkers() {
    // 古いマーカーがあれば削除（二重表示防止）
    if (locations.origin.marker) map.removeLayer(locations.origin.marker);
    if (locations.dest.marker) map.removeLayer(locations.dest.marker);

    // 出発地ピン (🚩)
    locations.origin.marker = L.marker(locations.origin.latlng, {
        icon: L.divIcon({ html: '🚩', className: 'marker-icon', iconSize: [30, 30] }),
        draggable: true
    }).addTo(map).on('dragend', function(e) {
        // ドラッグした後の座標を更新する処理があればここに
        locations.origin.latlng = [e.target.getLatLng().lat, e.target.getLatLng().lng];
        getRoute();
    });

    // 目的地ピン (🏁)
    locations.dest.marker = L.marker(locations.dest.latlng, {
        icon: L.divIcon({ html: '🏁', className: 'marker-icon', iconSize: [30, 30] }),
        draggable: true
    }).addTo(map).on('dragend', function(e) {
        locations.dest.latlng = [e.target.getLatLng().lat, e.target.getLatLng().lng];
        getRoute();
    });
}

function updateTimeline() {
    var container = document.getElementById('right-panel-content');

    // パネルが存在しない場合は処理を中断
    if (!container) return;

    // UI要素から設定を取得
    var reverseModeEl = document.getElementById('reverse-mode');
    var isReverse = reverseModeEl ? reverseModeEl.checked : false;

    var startTimeVal = document.getElementById('start-time') ? document.getElementById('start-time').value : "09:00";
    var targetTimeVal = document.getElementById('target-time') ? document.getElementById('target-time').value : "17:00";

    // 開始時間の計算（分単位）
    var startArr = (isReverse ? targetTimeVal : startTimeVal).split(':').map(Number);
    var cur = startArr[0] * 60 + startArr[1];

    // 時間フォーマット関数 (例: 540 -> "09:00")
    var fmt = function(t) {
        var hh = Math.floor((t / 60 + 24) % 24).toString().padStart(2, '0');
        var mm = (Math.abs(t) % 60).toString().padStart(2, '0');
        return hh + ":" + mm;
    };

    // 【重要】全地点を配列にまとめる（滞在時間をデータから取得するように修正）
    var allPoints = [
        { id: 'origin', name: locations.origin.name, icon: '🚩', stayTime: locations.origin.stayTime || 0 }
    ].concat(
        waypoints.map(function(w) {
            return { id: w.id, name: w.name, icon: '📍', stayTime: w.stayTime || 0 };
        }),
        [
            { id: 'dest', name: locations.dest.name, icon: '🏁', stayTime: locations.dest.stayTime || 0 }
        ]
    );

    var events = [];
    var tempCur = cur;

    if (isReverse) {
        // --- 【逆算モード】到着時間から出発時間を割り出す ---
        for (var i = allPoints.length - 1;i >= 0;i--) {
            var pt = allPoints[i];
            var hasCustomEvents = customEvents[pt.id] && customEvents[pt.id].length > 0;

            if (hasCustomEvents) {
                for (var j = customEvents[pt.id].length - 1;j >= 0;j--) {
                    var ev = customEvents[pt.id][j];
                    events.unshift({
                        type: 'custom',
                        task: '<input type="text" class="wp-desc-input" value="' + ev.task + '" oninput="updateEventName(\'' + pt.id + '\', ' + j + ', this.value)"> ' +
                            '(<input type="number" class="stay-time-input" value="' + ev.dur + '" oninput="updateEventDur(\'' + pt.id + '\', ' + j + ', this.value)">分)',
                        dur: ev.dur,
                        time: tempCur - ev.dur,
                        pointId: pt.id,
                        idx: j
                    });
                    tempCur -= (Number(ev.dur) || 0);
                }
            } else if (pt.stayTime > 0) {
                events.unshift({
                    type: 'custom',
                    task: '<input type="number" class="stay-time-input" value="' + pt.stayTime + '" oninput="updateStayTime(\'' + pt.id + '\', this.value)">分 滞在・休憩',
                    dur: pt.stayTime,
                    time: tempCur - pt.stayTime,
                    pointId: pt.id,
                    idx: -1
                });
                tempCur -= (Number(pt.stayTime) || 0);
            }

            events.unshift({ type: 'point', name: pt.name, icon: pt.icon, time: tempCur, pointId: pt.id });

            if (i > 0 && routeLegs && routeLegs[i - 1]) {
                tempCur -= Math.round(routeLegs[i - 1].duration / 60);
            }
        }
    } else {
        // --- 【順算モード】出発時間から到着時間を割り出す ---
        allPoints.forEach(function(pt, i) {
            if (i > 0 && routeLegs && routeLegs[i - 1]) {
                tempCur += Math.round(routeLegs[i - 1].duration / 60);
            }

            events.push({ type: 'point', name: pt.name, icon: pt.icon, time: tempCur, pointId: pt.id });

            var hasCustomEvents = customEvents[pt.id] && customEvents[pt.id].length > 0;

            if (hasCustomEvents) {
                customEvents[pt.id].forEach(function(ev, idx) {
                    events.push({
                        type: 'custom',
                        task: '<input type="text" class="wp-desc-input" value="' + ev.task + '" oninput="updateEventName(\'' + pt.id + '\', ' + idx + ', this.value)"> ' +
                            '(<input type="number" class="stay-time-input" value="' + ev.dur + '" oninput="updateEventDur(\'' + pt.id + '\', ' + idx + ', this.value)">分)',
                        dur: ev.dur,
                        time: tempCur,
                        pointId: pt.id,
                        idx: idx
                    });
                    tempCur += (Number(ev.dur) || 0);
                });
            } else if (pt.stayTime > 0) {
                events.push({
                    type: 'custom',
                    task: '<input type="number" class="stay-time-input" value="' + pt.stayTime + '" oninput="updateStayTime(\'' + pt.id + '\', this.value)">分 滞在・休憩',
                    dur: pt.stayTime,
                    time: tempCur,
                    pointId: pt.id,
                    idx: -1
                });
                tempCur += (Number(pt.stayTime) || 0);
            }
        });
    }

    // HTMLの生成
    var html = '<div class="timeline-container" style="padding: 10px;">';
    events.forEach(function(ev) {
        if (ev.type === 'point') {
            html += '<div class="timeline-event" style="margin-bottom: 15px;">' +
                '<span class="time-tag" style="background: #4a90e2; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-right: 10px;">' + fmt(ev.time) + '</span>' +
                '<strong>' + ev.icon + ' ' + ev.name + '</strong>' +
                '<button class="add-btn" style="margin-left:10px; font-size:0.7em;" onclick="addEventPrompt(\'' + ev.pointId + '\')">＋予定</button>' +
                '</div>';
        } else {
            html += '<div class="timeline-event" style="border-left:2px dashed #ccc; margin: -10px 0 10px 25px; padding-left:20px; color:#555; font-size: 0.9em;">' +
                '<span class="time-tag" style="color: #666; font-weight: bold; margin-right: 8px;">' + fmt(ev.time) + '</span>' +
                '<span>🍴 ' + ev.task + '</span>';
            if (ev.idx !== -1) {
                html += '<button class="remove-btn" style="font-size:0.7em; color: red; border: none; background: none;" onclick="removeEvent(\'' + ev.pointId + '\', ' + ev.idx + ')">×</button>';
            }
            html += '</div>';
        }
    });

    container.innerHTML = html + '</div>';
}

/**
 * 滞在時間を更新する関数（唯一の正解）
 */
function updateStayTime(id, value) {
    var val = parseInt(value) || 0;

    if (id === 'origin') {
        locations.origin.stayTime = val;
    } else if (id === 'dest') {
        locations.dest.stayTime = val;
    } else {
        var wp = waypoints.find(function(w) { return w.id === id; });
        if (!wp && typeof returnWaypoints !== 'undefined') {
            wp = returnWaypoints.find(function(w) { return w.id === id; });
        }
        if (wp) wp.stayTime = val;
    }

    // タイムラインを即時更新
    updateTimeline();

    // ルート再計算を予約（1秒後）
    clearTimeout(window.routeTimer);
    window.routeTimer = setTimeout(function() {
        if (typeof getRoute === 'function') getRoute();
    }, 1000);
}

/**
 * 予定の時間(ランチ等)を更新する関数
 */
function updateEventDur(pointId, idx, newDur) {
    var val = parseInt(newDur) || 0;
    if (customEvents[pointId] && customEvents[pointId][idx]) {
        customEvents[pointId][idx].dur = val;
        updateTimeline();
    }
}

/**
 * 予定の名前を更新する関数
 */
function updateEventName(pointId, idx, newName) {
    if (customEvents[pointId] && customEvents[pointId][idx]) {
        customEvents[pointId][idx].task = newName;
    }
}
// --- JSPから送られてきたデータを復元する関数 ---
function restorePlan() {
    console.log("🐾 データの復元を開始します...");

    // 1. 日付の復元
    if (jspConfig.departureDate) {
        document.getElementById('start-date').value = jspConfig.departureDate;
    }

    // 2. 費用の復元
    // categoriesに合わせてセット（以前作った restoreExpenses を利用）
    var initialCosts = {
        hotel: [{ label: "宿泊費", price: jspConfig.savedCosts.hotel }],
        food: [{ label: "食費合計", price: jspConfig.savedCosts.food }],
        other: [{ label: "お土産代", price: jspConfig.savedCosts.other }]
    };
    restoreExpenses(initialCosts);

    // 3. 経由地の復元
    if (jspConfig.savedWaypoints && jspConfig.savedWaypoints.length > 0) {
        jspConfig.savedWaypoints.forEach(wp => {
            var latlng = { lat: wp.lat, lng: wp.lng };
            // isReturnがtrueなら帰り、falseなら行きの関数を呼ぶ
            if (wp.isReturn) {
                addReturnWaypoint(latlng, wp.name, wp.stayTime);
            } else {
                addNewWaypoint(latlng, wp.name, wp.stayTime);
            }
        });
    }

    // 4. 初期計算
    getRoute();
    restoreCostsFromModel();
}
function restoreCostsFromModel() {
    var c = jspConfig.savedCosts2;
    if (!c) return;

    document.getElementById('hotel-fee').value = c.hotelOut;
    document.getElementById('food-fee').value = c.foodOut;
    document.getElementById('other-fee').value = c.otherOut;

    document.getElementById('hotel-fee-ret').value = c.hotelRet;
    document.getElementById('food-fee-ret').value = c.foodRet;
    document.getElementById('other-fee-ret').value = c.otherRet;

    updateGrandTotalSafe();
}

// --- モードバッジの表示更新 ---
function updateModeDisplay() {
    var badge = document.getElementById('mode-badge');
    if (!badge) return;

    if (isReturnTrip) {
        badge.innerText = "🏠 復路（帰り）を編集中";
        badge.className = "badge-return"; // CSSで色を変える用
    } else {
        badge.innerText = "✈️ 往路（行き）を編集中";
        badge.className = "badge-outbound";
    }
}
function fetchRouteSpots(coords) {
    var list = document.getElementById('recommend-list');
    if (!list) return;
    list.innerHTML = "";
    var step = Math.floor(coords.length / 6);
    for (var i = 1;i <= 5;i++) {
        (function(idx) {
            var pt = coords[idx * step];
            if (!pt) return;
            var url = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + pt[1] + '&lon=' + pt[0] + '&zoom=12';
            fetch(url, { headers: { 'Accept-Language': 'ja' } })
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    var name = data.address.city || data.address.town || "地点";
                    var div = document.createElement('div');
                    div.style = "padding:8px; border-bottom:1px solid #eee; cursor:pointer; font-size:0.8em;";
                    div.innerHTML = '📍 ' + name + ' <span style="color:blue;">▶追加</span>';
                    div.onclick = function() { addNewWaypoint({ lat: pt[1], lng: pt[0] }); };
                    list.appendChild(div);
                })
                .catch(function() {});
        })(i);
    }
}
/**
 * ガソリン代を計算する関数（安全版）
 */
function calcGasCost() {
    console.log("calcGasCost距離:", totalDistanceKm);

    var fuelEffEl = document.getElementById('fuel-efficiency');
    var gasPriceEl = document.getElementById('fuel-price');
    var fuelEff = fuelEffEl ? parseFloat(fuelEffEl.value) : 15;
    var gasPrice = gasPriceEl ? parseFloat(gasPriceEl.value) : 170;

    // ★ グローバル totalDistanceKm を使う
    var dist = totalDistanceKm;

    gasCost = Math.round((dist / fuelEff) * gasPrice);

    if (isReturnTrip) {
        jspreturnExpenses.gas = gasCost;
    } else {
        jspoutboundExpenses.gas = gasCost;
    }

    updateGrandTotal();
}
function calcHighwayCost() {
    // ★ グローバル totalDistanceKm を使う
    var dist = totalDistanceKm;

    var carTypeEl = document.getElementById('car-type');
    var carFactor = carTypeEl ? parseFloat(carTypeEl.value) : 1.0;

    var etcHol = document.getElementById('etc-holiday');
    var etcMid = document.getElementById('etc-midnight');
    var isEtc = (etcHol && etcHol.checked) || (etcMid && etcMid.checked);

    var baseH = ((dist * 24.6) + 150) * carFactor * 1.1;
    var disc = isEtc ? 0.7 : 1.0;

    highwayCost = (dist < 5) ? 0 : Math.round(baseH * disc);

    if (isReturnTrip) {
        jspreturnExpenses.highway = highwayCost;
    } else {
        jspoutboundExpenses.highway = highwayCost;
    }

    updateGrandTotal();
}
function getFeeValue(id) {
    var el = document.getElementById(id);
    // 要素が存在し、かつ値がある場合は数値に変換。それ以外は0を返す。
    return el ? Number(el.value) || 0 : 0;
}

function updateGrandTotal() {
    // --- 往路の集計 ---
    var outboundHotel = 0, outboundFood = 0, outboundOther = 0;
    if (jspoutboundExpenses && jspoutboundExpenses.hotel) {
        jspoutboundExpenses.hotel.forEach(item => outboundHotel += item.price || 0);
    }
    if (jspoutboundExpenses && jspoutboundExpenses.food) {
        jspoutboundExpenses.food.forEach(item => outboundFood += item.price || 0);
    }
    if (jspoutboundExpenses && jspoutboundExpenses.other) {
        jspoutboundExpenses.other.forEach(item => outboundOther += item.price || 0);
    }

    jspoutboundExpenses.hotelTotal = outboundHotel;
    jspoutboundExpenses.foodTotal = outboundFood;
    jspoutboundExpenses.otherTotal = outboundOther;

    // --- 復路の集計 ---
    var returnHotel = 0, returnFood = 0, returnOther = 0;
    if (jspreturnExpenses && jspreturnExpenses.hotel) {
        jspreturnExpenses.hotel.forEach(item => returnHotel += item.price || 0);
    }
    if (jspreturnExpenses && jspreturnExpenses.food) {
        jspreturnExpenses.food.forEach(item => returnFood += item.price || 0);
    }
    if (jspreturnExpenses && jspreturnExpenses.other) {
        jspreturnExpenses.other.forEach(item => returnOther += item.price || 0);
    }

    jspreturnExpenses.hotelTotal = returnHotel;
    jspreturnExpenses.foodTotal = returnFood;
    jspreturnExpenses.otherTotal = returnOther;

    // --- 片道ごとの合計 ---
    var outboundTotal =
        (jspoutboundExpenses.hotelTotal || 0) +
        (jspoutboundExpenses.foodTotal || 0) +
        (jspoutboundExpenses.otherTotal || 0) +
        (jspoutboundExpenses.gas || 0) +
        (jspoutboundExpenses.highway || 0);

    var returnTotal =
        (jspreturnExpenses.hotelTotal || 0) +
        (jspreturnExpenses.foodTotal || 0) +
        (jspreturnExpenses.otherTotal || 0) +
        (jspreturnExpenses.gas || 0) +
        (jspreturnExpenses.highway || 0);

    // --- 往復合計 ---
    var totalAll = outboundTotal + returnTotal;

    // --- 表示更新 ---
    document.getElementById("outbound-total-sub").innerText = outboundTotal.toLocaleString();
    document.getElementById("return-total-sub").innerText = returnTotal.toLocaleString();
    document.getElementById("grand-total-display").innerText = "¥" + totalAll.toLocaleString();

}

function toggleReverseArea() {
    var isChecked = document.getElementById('reverse-mode').checked;
    var area = document.getElementById('target-time-area');
    if (area) {
        area.style.display = isChecked ? 'block' : 'none'; 
    }
    // モード切り替え時にルートを再計算
    addMainMarkers();
    if (typeof getRoute === "function") getRoute();
}

function forceUpdateCurrentModeTotal() {
    console.log("💰 現在のモードの全費用を再計算します");

    // 1. 現在のモード（isReturnTrip）に応じた「宿泊・食費・その他」のデータを取得
    var targetExp = isReturnTrip ? jspreturnExpenses : jspoutboundExpenses;

    var h = 0; if (targetExp.hotel) targetExp.hotel.forEach(i => h += (parseInt(i.price) || 0));
    var f = 0; if (targetExp.food) targetExp.food.forEach(i => f += (parseInt(i.price) || 0));
    var o = 0; if (targetExp.other) targetExp.other.forEach(i => o += (parseInt(i.price) || 0));

    // 2. 現在のモードに応じた「ガソリン代・高速代」を取得
    // ※ calcGasCost等で計算された gasCost, highwayCost 変数を使用
    var g = (typeof gasCost !== 'undefined') ? gasCost : 0;
    var s = (typeof highwayCost !== 'undefined') ? highwayCost : 0;

    // 3. 【全項目を合算】 
    // これにより 3,192 + 7,786 + 100,000 + 100,000 = 210,978 となります
    var currentTotal = h + f + o + g + s;

    // 4. 画面上の各数値を現在のモードに合わせて更新
    if (document.getElementById('disp-hotel')) document.getElementById('disp-hotel').innerText = "¥ " + h.toLocaleString();
    if (document.getElementById('disp-food')) document.getElementById('disp-food').innerText = "¥ " + f.toLocaleString();
    if (document.getElementById('disp-other')) document.getElementById('disp-other').innerText = "¥ " + o.toLocaleString();
    if (document.getElementById('disp-gas')) document.getElementById('disp-gas').innerText = "¥ " + g.toLocaleString();
    if (document.getElementById('disp-highway')) document.getElementById('disp-highway').innerText = "¥ " + s.toLocaleString();

    // 5. 一番上のメイン合計欄を更新
    var totalEl = document.getElementById('disp-total');
    if (totalEl) {
        totalEl.innerText = "¥ " + currentTotal.toLocaleString();
    }

    // 旅の合計予算（往復総合計）側の表示も連動させる場合
    var grandTotalDisp = document.getElementById('grand-total-display');
    if (grandTotalDisp) {
        grandTotalDisp.innerText = "¥ " + currentTotal.toLocaleString();
    }
}

// --- 既存の古い計算関数を無効化、または上書きするための割り込み設定 ---

// A. 往復切り替え時の最後に実行
var oldReverseRoute = reverseRoute;
reverseRoute = function() {
    if (typeof oldReverseRoute === 'function') oldReverseRoute();
    forceUpdateCurrentModeTotal();
};
document.addEventListener('input', function(e) {
    // 宿泊費・食費などの入力欄（クラス名に-priceを含むもの）か、数値入力の場合
    if (e.target.className.indexOf('-price') !== -1 || e.target.type === 'number') {
        // 入力値を即座に変数へ保存してから再計算
        if (typeof saveExp === 'function') saveExp();
        forceUpdateCurrentModeTotal();
    }
});
/**
 * 【最終合体版】往路と復路をそれぞれ計算し、
 * 「往復総合計」「往路合計」「復路合計」のすべてを正しく表示する
 */
/**
 * 【往復完全合算】往路と復路それぞれの5項目をすべて計算し、
 * 一番上の「💰 旅の合計予算（往復総合計）」を正しく更新する
 */
function updateRoundTripGrandTotal() {
    // console.log("🐾 往復の最終集計を実行します...");

    try {
        // 表示文字から数字を抜く補助関数
        var getValFromDisplay = (id) => {
            var el = document.getElementById(id);
            if (!el) return 0;
            return parseInt(el.innerText.replace(/[^0-9]/g, "")) || 0;
        };

        // 入力欄(input)から数字を抜く補助関数
        var getValFromInput = (id) => {
            var el = document.getElementById(id);
            return el ? (parseInt(el.value) || 0) : 0;
        };

        // --- 1. 現在の「入力欄」の合計を計算 (宿泊+食費+その他) ---
        var h = getValFromInput('hotel-fee');
        var f = getValFromInput('food-fee');
        var o = getValFromInput('other-fee');
        var currentInputTotal = h + f + o;

        // --- 2. 移動費 (window変数から取得) ---
        var currentMoveTotal = (window.gasCost || 0) + (window.highwayCost || 0);

        // --- 3. 今編集中のモード（往路/復路）の小計を更新 ---
        var currentEditTotal = currentInputTotal + currentMoveTotal;

        if (typeof isReturnTrip !== 'undefined' && isReturnTrip) {
            var retSub = document.getElementById('return-total-sub');
            if (retSub) retSub.innerText = "¥ " + currentEditTotal.toLocaleString();
        } else {
            var outSub = document.getElementById('outbound-total-sub');
            if (outSub) outSub.innerText = "¥ " + currentEditTotal.toLocaleString();
        }

        // --- 4. 往路ラベルと復路ラベルを足して「本当の総合計」を出す ---
        var outVal = getValFromDisplay('outbound-total-sub');
        var retVal = getValFromDisplay('return-total-sub');
        var finalSum = outVal + retVal;

        // --- 5. 画面への反映 ---
        var gtEl = document.getElementById('grand-total-display');
        var dtEl = document.getElementById('disp-total'); // 黒背景の合計

        if (gtEl) gtEl.innerText = "¥ " + finalSum.toLocaleString();
        if (dtEl) dtEl.innerText = "¥ " + finalSum.toLocaleString();

        // 内訳ラベル（disp-hotel等）もついでに更新しておくと確実
        if (document.getElementById('disp-hotel')) document.getElementById('disp-hotel').innerText = "¥ " + h.toLocaleString();
        if (document.getElementById('disp-food')) document.getElementById('disp-food').innerText = "¥ " + f.toLocaleString();
        if (document.getElementById('disp-other')) document.getElementById('disp-other').innerText = "¥ " + o.toLocaleString();

    } catch (e) {
        console.warn("総合計の計算中にエラー:", e.message);
    }
} (function() {
    // ページ読み込み完了時に実行
    window.addEventListener('load', function() {
        if (typeof jspConfig === 'undefined' || !jspConfig.savedWaypoints) {
            console.log("🐾 新規作成モードです（保存データなし）");
            return;
        }

        console.log("🏗️ 保存データの展開を開始します...");

        // 1. 出発地・目的地の名前を反映
        if (locations.origin) locations.origin.name = jspConfig.originName;
        if (locations.dest) locations.dest.name = jspConfig.destName;

        // 2. 配列を一度空にしてから、保存データを流し込む
        outboundWaypoints = [];
        returnWaypoints = [];

        jspConfig.savedWaypoints.forEach(wp => {
            var data = {
                name: wp.name,
                latlng: [wp.lat, wp.lng],
                stayTime: wp.stayTime || 0,
                description: wp.description || ""
            };
            // 行きか帰りかで振り分け
            if (wp.isReturn === true || wp.isReturn === "true") {
                returnWaypoints.push(data);
            } else {
                outboundWaypoints.push(data);
            }
        });

        // 3. 現在の作業用配列を「往路」にセット
        isReturnTrip = false;
        waypoints = outboundWaypoints;

        // 4. 地図とリストの「見た目」を復活させる
        // ※ 0.5秒待つのは、地図(Leaflet)の準備完了を確実にするため
        setTimeout(function() {
            // メインのピン（出発・到着）を立てる
            if (typeof addMainMarkers === 'function') addMainMarkers();

            // 右側のリスト（中継地）を出す
            if (typeof renderWaypointList === 'function') renderWaypointList();

            // ルートの青い線を引く
            if (typeof getRoute === 'function') getRoute();

            // 宿泊費などの入力欄に数字を入れる
            if (jspConfig.savedCosts) {
                if (document.getElementById('hotel-fee')) document.getElementById('hotel-fee').value = jspConfig.savedCosts.hotel;
                if (document.getElementById('food-fee')) document.getElementById('food-fee').value = jspConfig.savedCosts.food;
                if (document.getElementById('other-fee')) document.getElementById('other-fee').value = jspConfig.savedCosts.other;
            }


            updateGrandTotal();


            console.log("✨ 画面の完全再現が完了しました！");
        }, 600);
    });
})();
// trip.js の一番下でOK
function restoreExpenses(data) {
    console.log("💸予算復元開始:", data);

    ['hotel', 'food', 'other'].forEach(function(type) {
        var container = document.getElementById(type + '-container');
        if (!container) return;

        container.innerHTML = "";

        var items;

        // ★ savedCosts が数値だった場合 → 配列に変換
        if (Array.isArray(data[type])) {
            items = data[type];
        } else {
            items = [{
                label: (type === 'hotel' ? '宿泊費' :
                    type === 'food' ? '食費合計' : 'その他'),
                price: Number(data[type] || 0)
            }];
        }

        items.forEach(function(item) {
            var div = document.createElement('div');
            div.className = 'dynamic-input-row';

            var labelInput = document.createElement('input');
            labelInput.type = 'text';
            labelInput.value = item.label || "";
            labelInput.oninput = saveExp;

            var priceInput = document.createElement('input');
            priceInput.type = 'number';
            priceInput.className = type + '-price';
            priceInput.value = Number(item.price || 0);
            priceInput.oninput = function() { saveExp(); calcTotal(); };

            div.appendChild(labelInput);
            div.appendChild(priceInput);
            container.appendChild(div);
        });

        // ★ currentExp に正しい配列を反映
        if (isReturnTrip) {
            jspreturnExpenses[type] = items;
        } else {
            jspoutboundExpenses[type] = items;
        }

        calcTotal();
    });
}
function syncInputFields() {
    var oIn = document.getElementById('origin-input');
    var dIn = document.getElementById('dest-input');

    // locationsオブジェクトにデータがある場合のみ、画面を書き換える
    if (locations.origin && oIn) {
        oIn.value = locations.origin.name;
    }
    if (locations.dest && dIn) {
        dIn.value = locations.dest.name;
    }
    console.log("📍 入力欄を最新データに同期しました");
}
document.addEventListener('DOMContentLoaded', function() {
    var oIn = document.getElementById('origin-input');
    var dIn = document.getElementById('dest-input');

    // --- 1. 入力欄のイベントリスナー（既存の処理） ---
    if (oIn) {
        oIn.addEventListener('input', function(e) {
            if (locations.origin) {
                locations.origin.name = e.target.value;
                console.log("✅ 出発地を変数に保存:", locations.origin.name);
            }
        });
    }

    if (dIn) {
        dIn.addEventListener('input', function(e) {
            if (locations.dest) {
                locations.dest.name = e.target.value;
                console.log("✅ 目的地を変数に保存:", locations.dest.name);
            }
        });
    }

    // --- 2. 【追加】JSPから届いた座標を地図に叩き込む処理 ---
    if (typeof jspConfig !== 'undefined' && jspConfig.originLat && jspConfig.originLat !== 0) {
        console.log("📍 DBの座標を地図に復元します...");

        // locationsオブジェクトの座標をDBの値で上書き
        locations.origin.latlng = [jspConfig.originLat, jspConfig.originLng];
        locations.dest.latlng   = [jspConfig.destLat, jspConfig.destLng];

        // 地図の中心を保存された出発地に移動
        if (map) {
            map.setView(locations.origin.latlng, 12);
        }

        // 座標が確定したので、即座にルート検索を実行して地図を描画
        if (typeof getRoute === 'function') {
            getRoute();
        }
    }
});
function syncAddress() {
    const originInput = document.getElementById("origin"); // IDはJSPに合わせて調整
    const startValue = originInput ? originInput.value : "";
    console.log("📍 住所を同期します: " + startValue);

    // もし住所から座標を取得する（ジオコーディング）などの処理が必要ならここに書く
    // 特になければ、ログを出すだけの空関数でもエラーは消えます
}
/**
 * ルート描画と距離計算をリセットする共通関数
 * Javaの clear() メソッドのような役割
 */
function resetRouteState() {
    console.log("♻️ [Reset] 距離と地図上の線をリセットします...");

    // 1. 距離変数を 0 に（2719.6km 対策）
    totalDistanceKm = 0;

    // 2. 地図の線（Polyline）を消去（二重線対策）
    // mapがnull（undefined）の時は実行しない（Javaの null check）
    if (typeof map !== 'undefined' && map !== null) {
        map.eachLayer(function(layer) {
            if (layer instanceof L.Polyline) {
                map.removeLayer(layer);
            }
        });
        console.log("   -> 地図上の Polyline を削除しました");
    } else {
        console.log("   -> map が未初期化のため、レイヤー削除はスキップします");
    }
}
function renderWaypointList() {
    // 1. 地図上の「中継地ピン」を一旦すべてリセット（古いピンが残るのを防ぐ）
    waypoints.forEach(function(wp) { if (wp.marker) map.removeLayer(wp.marker); });
    returnWaypoints.forEach(function(wp) { if (wp.marker) map.removeLayer(wp.marker); });

    // --- 往路（行き）のリスト描画 ---
    var container = document.getElementById('waypoint-list-container');
    if (container) {
        container.innerHTML = "";
        waypoints.forEach(function(wp) {
            var div = document.createElement('div');
            div.className = 'waypoint-item';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:bold;">往：📍 ${wp.name}</span>
                    <button type="button" class="remove-btn" onclick="removeWaypoint('${wp.id}', false)">削除</button>
                </div>
            `;
            container.appendChild(div);

            // 往路を表示中（isReturnTripがfalse）なら地図にピンを立てる
            if (!isReturnTrip) {
                wp.marker = createMarker(wp, 'red'); // 赤いピンで描画
            }
        });
    }

    // --- 復路（帰り）のリスト描画 ---
    var returnContainer = document.getElementById('return-waypoint-list-container');
    if (returnContainer) {
        returnContainer.innerHTML = "";
        returnWaypoints.forEach(function(wp) {
            var div = document.createElement('div');
            div.className = 'waypoint-item';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:bold; color:#e67e22;">復：📍 ${wp.name}</span>
                    <button type="button" class="remove-btn" onclick="removeWaypoint('${wp.id}', true)">削除</button>
                </div>
            `;
            returnContainer.appendChild(div);

            // 復路を表示中（isReturnTripがtrue）なら地図にピンを立てる
            if (isReturnTrip) {
                wp.marker = createMarker(wp, 'red'); // 復路も赤いピンで描画
            }
        });
    }
}