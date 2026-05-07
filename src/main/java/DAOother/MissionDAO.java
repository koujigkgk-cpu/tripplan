package DAOother;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import modelother.Mission;
import util.DBUtil;

public class MissionDAO {
    // 指定した旅行IDのミッション一覧を取得する
    public List<Mission> findByTripId(int tripId) {
        List<Mission> missionList = new ArrayList<>();
        String sql = "SELECT id, trip_id, title, category, is_completed FROM missions WHERE trip_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, tripId);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                int id = rs.getInt("id");
                String title = rs.getString("title");
                String category = rs.getString("category");
                boolean isCompleted = rs.getBoolean("is_completed");
                
                missionList.add(new Mission(id, tripId, title, category, isCompleted));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return missionList;
    }

    // ミッションの状態（成功/未）を更新するメソッド（後で使います）
    public boolean updateStatus(int missionId, boolean isCompleted) {
        String sql = "UPDATE missions SET is_completed = ? WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setBoolean(1, isCompleted);
            pstmt.setInt(2, missionId);
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}