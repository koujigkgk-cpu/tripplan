package servletother;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import util.DBUtil;

@WebServlet("/SaveFullPlanServlet")
public class SaveFullPlanServlet extends HttpServlet {

    // ★ 時間文字列（例: "3時間 50分"）→ 分に変換
    private int parseDurationToMinutes(String text) {
        if (text == null || text.isEmpty()) return 0;

        int hours = 0;
        int minutes = 0;

        try {
            if (text.contains("時間")) {
                String h = text.substring(0, text.indexOf("時間")).trim();
                hours = Integer.parseInt(h);
            }
            if (text.contains("分")) {
                String m = text.substring(text.indexOf("時間") + 2, text.indexOf("分")).trim();
                minutes = Integer.parseInt(m);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return hours * 60 + minutes;
    }

    // ★ 分 → "◯時間 ◯分" に戻す
    private String formatMinutes(int totalMinutes) {
        int h = totalMinutes / 60;
        int m = totalMinutes % 60;
        return h + "時間 " + m + "分";
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root;
        try {
            root = mapper.readTree(request.getReader());
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        // -----------------------------
        // 1. JSONデータの抽出
        // -----------------------------
        String originName = root.has("originName") ? root.get("originName").asText() : "広島駅";
        String destination = root.has("destName") ? root.get("destName").asText() : "目的地未設定";
        String departureDate = root.has("startDate") ? root.get("startDate").asText() : "";
        double originLat = root.path("originLat").asDouble(0.0);
        double originLng = root.path("originLng").asDouble(0.0);
        double destLat   = root.path("destLat").asDouble(0.0);
        double destLng   = root.path("destLng").asDouble(0.0);
        JsonNode outbound = root.get("outbound");
        JsonNode ret = root.get("return");

        // --- 往路 ---
        int fuelCost = outbound.has("fuelCost") ? outbound.get("fuelCost").asInt() : 0;
        int highwayFee = outbound.has("highwayCost") ? outbound.get("highwayCost").asInt() : 0;
        double outboundDistanceKm = outbound.has("distanceKm") ? outbound.get("distanceKm").asDouble() : 0.0;
        String outboundDurationText = outbound.has("durationText") ? outbound.get("durationText").asText() : "";

        // --- 復路 ---
        double returnDistanceKm = ret.has("distanceKm") ? ret.get("distanceKm").asDouble() : 0.0;
        String returnDurationText = ret.has("durationText") ? ret.get("durationText").asText() : "";

        // -----------------------------
        // ★★★ 合計距離・合計時間を計算 ★★★
        // -----------------------------
        double distanceKm = outboundDistanceKm + returnDistanceKm;

        int outMin = parseDurationToMinutes(outboundDurationText);
        int retMin = parseDurationToMinutes(returnDurationText);
        int totalMin = outMin + retMin;

        String durationText = formatMinutes(totalMin);  // ← 例：7時間 36分

        // -----------------------------
        // 2. 総予算の計算
        // -----------------------------
        final int[] totalAmount = { 0 };
        String[] types = { "outbound", "return" };

        for (String type : types) {
            if (!root.has(type)) continue;

            JsonNode typeNode = root.get(type);

            totalAmount[0] += typeNode.has("fuelCost") ? typeNode.get("fuelCost").asInt() : 0;
            totalAmount[0] += typeNode.has("highwayCost") ? typeNode.get("highwayCost").asInt() : 0;

            if (typeNode.has("expenses")) {
                typeNode.get("expenses").forEach(catNode -> {
                    catNode.forEach(item -> totalAmount[0] += item.get("price").asInt());
                });
            }
        }

        Connection conn = null;
        try {
            conn = DBUtil.getConnection();
            conn.setAutoCommit(false);

            // -----------------------------
            // A. tripsテーブルの保存
            // -----------------------------
            int tripId = insertTrip(
                    conn,
                    originName,
                    destination,
                    departureDate,
                    totalAmount[0],
                    fuelCost,
                    highwayFee,
                    distanceKm,
                    durationText,
                    outboundDistanceKm,
                    outboundDurationText,
                    returnDistanceKm,
                    returnDurationText,
                    // ここで、もし「帰り」の登録なら、引数の順番を意図的に入れ替える
                    originLat,  // 13: origin_lat
                    originLng,  // 14: origin_lng
                    destLat,    // 15: dest_lat
                    destLng     // 16: dest_lng
                );
            if (tripId == -1) throw new SQLException("Trip ID の取得に失敗しました");

            // -----------------------------
            // B. 経由地の保存
            // -----------------------------
            String sqlWp = "INSERT INTO trip_waypoints (trip_id, name, lat, lng, sort_order, stay_time, is_return, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

         // --- 131行目付近 ---
            try (PreparedStatement pstmt = conn.prepareStatement(sqlWp)) {
                int order = 0;

                for (String type : types) {
                    if (!root.has(type)) continue;

                    JsonNode typeNode = root.get(type);
                    if (!typeNode.has("waypoints")) continue;

                    int isRet = type.equals("return") ? 1 : 0;

                    for (JsonNode wp : typeNode.get("waypoints")) {
                        pstmt.setInt(1, tripId);
                        pstmt.setString(2, wp.get("name").asText());
                        pstmt.setDouble(3, wp.get("lat").asDouble());
                        pstmt.setDouble(4, wp.get("lng").asDouble());
                        pstmt.setInt(5, order++);

                        // ★★★ ここから入れ替え ★★★
                        int totalStayTime = wp.path("stayTime").asInt(0);
                        String memo = wp.path("description").asText("");

                        // もしJS側が古い「details」形式で送ってきた場合、ここで補完する
                        if (memo.isEmpty() && wp.has("details")) {
                            StringBuilder sb = new StringBuilder();
                            for (JsonNode detail : wp.get("details")) {
                                if (sb.length() > 0) sb.append(", ");
                                sb.append(detail.get("task").asText());
                                totalStayTime += detail.get("dur").asInt();
                            }
                            memo = sb.toString();
                        }

                        pstmt.setInt(6, totalStayTime);
                        pstmt.setInt(7, isRet);
                        pstmt.setString(8, memo);
                        // ★★★ ここまで入れ替え ★★★

                        pstmt.addBatch();
                    }
                }
                pstmt.executeBatch();
            }            // -----------------------------
            // C. 予算内訳の保存
            // -----------------------------
            String sqlBg = "INSERT INTO trip_budgets (trip_id, category, label, amount, is_return) VALUES (?, ?, ?, ?, ?)";

            try (PreparedStatement pstmt = conn.prepareStatement(sqlBg)) {

                for (String type : types) {
                    if (!root.has(type)) continue;

                    JsonNode typeNode = root.get(type);
                    int isRet = type.equals("return") ? 1 : 0;
                    String prefix = type.equals("outbound") ? "往路:" : "復路:";

                    int g = typeNode.has("fuelCost") ? typeNode.get("fuelCost").asInt() : 0;
                    int h = typeNode.has("highwayCost") ? typeNode.get("highwayCost").asInt() : 0;

                    if (g > 0) addBudgetBatch(pstmt, tripId, "transport", prefix + "ガソリン代", g, isRet);
                    if (h > 0) addBudgetBatch(pstmt, tripId, "transport", prefix + "高速道路代", h, isRet);

                    if (typeNode.has("expenses")) {
                        JsonNode expenses = typeNode.get("expenses");
                        expenses.fieldNames().forEachRemaining(cat -> {
                            for (JsonNode item : expenses.get(cat)) {
                                try {
                                    addBudgetBatch(pstmt, tripId, cat, item.get("label").asText(), item.get("price").asInt(), isRet);
                                } catch (SQLException e) { e.printStackTrace(); }
                            }
                        });
                    }
                }

                pstmt.executeBatch();
            }

            conn.commit();
            response.setStatus(HttpServletResponse.SC_OK);

        } catch (Exception e) {
            if (conn != null) try { conn.rollback(); } catch (SQLException ex) {}
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        } finally {
            if (conn != null) try { conn.close(); } catch (SQLException e) {}
        }
    }

    private void addBudgetBatch(PreparedStatement pstmt, int tripId, String cat, String label, int amount, int isRet) throws SQLException {
        pstmt.setInt(1, tripId);
        pstmt.setString(2, cat);
        pstmt.setString(3, label);
        pstmt.setInt(4, amount);
        pstmt.setInt(5, isRet);
        pstmt.addBatch();
    }

    // ★★★ tripsテーブルの完全対応版 INSERT ★★★
 // ★★★ tripsテーブルの完全対応版 INSERT ★★★
    private int insertTrip(Connection conn, String origin, String dest, String date, int budget, int fuel, int highway,
                           double dist, String duration,
                           double outboundDistanceKm, String outboundDurationText,
                           double returnDistanceKm, String returnDurationText,
                           double oLat, double oLng, double dLat, double dLng) throws SQLException {

        // SQL文のカラム名と ? の数を正確に16個に合わせる
        String sql = "INSERT INTO trips (origin, destination, departure_date, total_budget, fuel_cost, highway_fee, "
                   + "distance_km, duration_text, outbound_distance_km, outbound_duration_text, "
                   + "return_distance_km, return_duration_text, origin_lat, origin_lng, dest_lat, dest_lng) "
                   + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setString(1, origin);
            pstmt.setString(2, dest);
            pstmt.setString(3, date);
            pstmt.setInt(4, budget);
            pstmt.setInt(5, fuel);
            pstmt.setInt(6, highway);
            pstmt.setDouble(7, dist);
            pstmt.setString(8, duration);
            pstmt.setDouble(9, outboundDistanceKm);
            pstmt.setString(10, outboundDurationText);
            pstmt.setDouble(11, returnDistanceKm);
            pstmt.setString(12, returnDurationText);
            
            // 座標をセット (13〜16番目)
            pstmt.setDouble(13, oLat);
            pstmt.setDouble(14, oLng);
            pstmt.setDouble(15, dLat);
            pstmt.setDouble(16, dLng);

            pstmt.executeUpdate();

            try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                if (generatedKeys.next()) return generatedKeys.getInt(1);
                else return -1;
            }
        }
    }}