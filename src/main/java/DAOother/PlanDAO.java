package DAOother;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import modelother.Expense;
import modelother.Plan;
import modelother.Waypoint;
import util.DBUtil;

public class PlanDAO {

	// ============================================================
	// ★ 追加：費用を読み込むメソッド（TripListServlet が使う）
	// ============================================================
	public Map<String, Integer> getBudgetsByTripId(int tripId) {
		String sql = "SELECT category, amount, is_return FROM trip_budgets WHERE trip_id = ?";
		Map<String, Integer> map = new HashMap<>();

		// 初期値
		map.put("hotelOut", 0);
		map.put("foodOut", 0);
		map.put("otherOut", 0);
		map.put("transOut", 0);

		map.put("hotelRet", 0);
		map.put("foodRet", 0);
		map.put("otherRet", 0);
		map.put("transRet", 0);

		try (Connection conn = DBUtil.getConnection();
				PreparedStatement pstmt = conn.prepareStatement(sql)) {

			pstmt.setInt(1, tripId);
			ResultSet rs = pstmt.executeQuery();

			while (rs.next()) {
				String cat = rs.getString("category");
				int amt = rs.getInt("amount");
				int isRet = rs.getInt("is_return");

				if (isRet == 0) { // 往路
					switch (cat) {
					case "hotel":
						map.put("hotelOut", map.get("hotelOut") + amt);
						break;
					case "food":
						map.put("foodOut", map.get("foodOut") + amt);
						break;
					case "other":
						map.put("otherOut", map.get("otherOut") + amt);
						break;
					case "transport":
						map.put("transOut", map.get("transOut") + amt);
						break;
					}
				} else { // 復路
					switch (cat) {
					case "hotel":
						map.put("hotelRet", map.get("hotelRet") + amt);
						break;
					case "food":
						map.put("foodRet", map.get("foodRet") + amt);
						break;
					case "other":
						map.put("otherRet", map.get("otherRet") + amt);
						break;
					case "transport":
						map.put("transRet", map.get("transRet") + amt);
						break;
					}
				}
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return map;
	}

	// ============================================================
	// ★ 追加：詳細費用一覧（宿泊費・食費・その他の各行）
	// ============================================================
	public List<Expense> getExpenseList(int tripId) {
		List<Expense> list = new ArrayList<>();
		String sql = "SELECT category, label, amount, is_return "
				+ "FROM trip_budgets "
				+ "WHERE trip_id = ? AND category IN ('hotel', 'food', 'other')";

		try (Connection conn = DBUtil.getConnection();
				PreparedStatement pstmt = conn.prepareStatement(sql)) {

			pstmt.setInt(1, tripId);
			ResultSet rs = pstmt.executeQuery();

			while (rs.next()) {
				Expense exp = new Expense();
				exp.setCategory(rs.getString("category"));
				exp.setItemName(rs.getString("label"));
				exp.setPrice(rs.getInt("amount"));
				exp.setIsReturn(rs.getInt("is_return"));
				list.add(exp);
			}

		} catch (SQLException e) {
			e.printStackTrace();
		}

		return list;
	}

	// ============================================================
	// ★ 既存：Plan（trips + waypoints + budgets）を読み込む
	// ============================================================
	public Plan getPlanById(int id) {
		Plan plan = null;

		String sqlTrip = "SELECT id, origin, destination, departure_date, total_budget, " +
				"fuel_cost, highway_fee, distance_km, duration_text, " +
				"outbound_distance_km, outbound_duration_text, " +
				"return_distance_km, return_duration_text, " +
				"origin_lat, origin_lng, dest_lat, dest_lng " +
				"FROM trips WHERE id = ?";
		try (Connection conn = DBUtil.getConnection()) {

			// --- trips 読み込み ---
			try (PreparedStatement pstmt = conn.prepareStatement(sqlTrip)) {
				pstmt.setInt(1, id);
				ResultSet rs = pstmt.executeQuery();

				if (rs.next()) {
					plan = new Plan();
					plan.setId(rs.getInt("id"));
					plan.setStart(rs.getString("origin"));
					plan.setDestination(rs.getString("destination"));
					plan.setDepartureDate(rs.getString("departure_date"));
					plan.setTotalBudget(rs.getInt("total_budget"));

					plan.setOutboundDistanceKm(rs.getDouble("outbound_distance_km"));
					plan.setOutboundDurationText(rs.getString("outbound_duration_text"));
					plan.setReturnDistanceKm(rs.getDouble("return_distance_km"));
					plan.setReturnDurationText(rs.getString("return_duration_text"));

					plan.setOriginLat(rs.getDouble("origin_lat"));
					plan.setOriginLng(rs.getDouble("origin_lng"));
					plan.setDestLat(rs.getDouble("dest_lat"));
					plan.setDestLng(rs.getDouble("dest_lng"));
				}
			}

			// --- 経由地の読み込み ---
			if (plan != null) {
				// ★修正：SELECT に sort_order を追加
				String sqlWp = "SELECT name, lat, lng, is_return, stay_time, description, sort_order " +
						"FROM trip_waypoints WHERE trip_id = ? ORDER BY sort_order ASC";

				try (PreparedStatement pstmtWp = conn.prepareStatement(sqlWp)) {
					pstmtWp.setInt(1, id);
					ResultSet rsWp = pstmtWp.executeQuery();

					List<Waypoint> waypoints = new ArrayList<>();

					while (rsWp.next()) {
						Waypoint wp = new Waypoint();
						wp.setName(rsWp.getString("name"));
						wp.setLat(rsWp.getDouble("lat"));
						wp.setLng(rsWp.getDouble("lng"));
						wp.setIsReturn(rsWp.getInt("is_return"));
						wp.setStayTime(rsWp.getInt("stay_time"));
						wp.setDescription(rsWp.getString("description"));
						
						// ★修正：DBから取得した値を Waypoint オブジェクトにセット
						wp.setSortOrder(rsWp.getInt("sort_order"));

						waypoints.add(wp);
					}

					plan.setWaypoints(waypoints);
				}
			}

			// --- ★ 合計費用の読み込み ---
			if (plan != null) {
				Map<String, Integer> b = getBudgetsByTripId(id);

				plan.setHotelOutbound(b.get("hotelOut"));
				plan.setFoodOutbound(b.get("foodOut"));
				plan.setOtherOutbound(b.get("otherOut"));
				plan.setTransportOutbound(b.get("transOut"));

				plan.setHotelReturn(b.get("hotelRet"));
				plan.setFoodReturn(b.get("foodRet"));
				plan.setOtherReturn(b.get("otherRet"));
				plan.setTransportReturn(b.get("transRet"));
			}

		} catch (SQLException e) {
			e.printStackTrace();
		}

		return plan;
	}

	// ============================================================
	// ★ 一覧表示（費用は不要）
	// ============================================================
	public List<Plan> getAllPlans() {
		List<Plan> planList = new ArrayList<>();

		String sql = "SELECT id, origin, destination, departure_date, total_budget, " +
				"outbound_distance_km, outbound_duration_text, " +
				"return_distance_km, return_duration_text, " +
				"origin_lat, origin_lng, dest_lat, dest_lng " +
				"FROM trips ORDER BY id DESC";

		try (Connection conn = DBUtil.getConnection();
				PreparedStatement pstmt = conn.prepareStatement(sql);
				ResultSet rs = pstmt.executeQuery()) {

			while (rs.next()) {
				Plan plan = new Plan();
				plan.setId(rs.getInt("id"));
				plan.setStart(rs.getString("origin"));
				plan.setDestination(rs.getString("destination"));
				plan.setDepartureDate(rs.getString("departure_date"));
				plan.setTotalBudget(rs.getInt("total_budget"));

				plan.setOutboundDistanceKm(rs.getDouble("outbound_distance_km"));
				plan.setOutboundDurationText(rs.getString("outbound_duration_text"));
				plan.setReturnDistanceKm(rs.getDouble("return_distance_km"));
				plan.setReturnDurationText(rs.getString("return_duration_text"));

				plan.setOriginLat(rs.getDouble("origin_lat"));
				plan.setOriginLng(rs.getDouble("origin_lng"));
				plan.setDestLat(rs.getDouble("dest_lat"));
				plan.setDestLng(rs.getDouble("dest_lng"));

				planList.add(plan);
			}

		} catch (SQLException e) {
			e.printStackTrace();
		}

		return planList;
	}
}