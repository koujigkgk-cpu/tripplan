package DAOother;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import modelother.Expense;
import modelother.Trip;
import util.DBUtil;

public class SavingDAO {

    /**
     * 現在の貯金額を取得
     */
    public int getCurrentSavings(int tripId) {
        String sql = "SELECT current_amount FROM savings WHERE trip_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, tripId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("current_amount");
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    /**
     * 旅行の基本情報を取得（全17カラム対応）
     */
    public Trip getTripInfo(int tripId) {
        String sql = "SELECT * FROM trips WHERE id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, tripId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return new Trip(
                        rs.getInt("id"),
                        rs.getString("origin"),
                        rs.getString("destination"),
                        rs.getDate("departure_date").toLocalDate(),
                        rs.getInt("total_budget"),
                        rs.getInt("fuel_cost"),
                        rs.getInt("highway_fee"),
                        rs.getDouble("distance_km"),
                        rs.getString("duration_text"),
                        rs.getDouble("outbound_distance_km"),
                        rs.getString("outbound_duration_text"),
                        rs.getDouble("return_distance_km"),
                        rs.getString("return_duration_text"),
                        rs.getDouble("origin_lat"),
                        rs.getDouble("origin_lng"),
                        rs.getDouble("dest_lat"),
                        rs.getDouble("dest_lng")
                    );
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 予算内訳を取得
     */
    public List<Expense> getExpensesByTripId(int tripId) {
        List<Expense> list = new ArrayList<>();
        String sql = "SELECT category, label, amount, is_return FROM trip_budgets WHERE trip_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, tripId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Expense exp = new Expense();
                    exp.setCategory(rs.getString("category"));
                    exp.setItemName(rs.getString("label"));
                    exp.setPrice(rs.getInt("amount"));
                    exp.setIsReturn(rs.getInt("is_return"));
                    list.add(exp);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
}