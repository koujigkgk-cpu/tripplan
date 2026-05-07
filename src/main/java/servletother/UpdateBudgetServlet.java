package servletother;

import java.io.IOException;
import java.io.StringReader;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.stream.Collectors;

import javax.sql.DataSource;

import jakarta.annotation.Resource;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/UpdateBudgetServlet")
public class UpdateBudgetServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Resource(name = "jdbc/mysql") 
    private DataSource dataSource;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");

        // 1. 標準機能(Jakarta JSON)でJSONを受け取る
        String jsonStr = request.getReader().lines().collect(Collectors.joining());
        JsonObject json;
        try (JsonReader reader = Json.createReader(new StringReader(jsonStr))) {
            json = reader.readObject();
        } catch (Exception e) {
            response.setStatus(400);
            return;
        }

        int tripId = json.getInt("tripId");

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false); 

            try {
                // 2. 旧データの削除（重複を物理的に防ぐ）
                String deleteSql = "DELETE FROM trip_budgets WHERE trip_id = ?";
                try (PreparedStatement deleteStmt = conn.prepareStatement(deleteSql)) {
                    deleteStmt.setInt(1, tripId);
                    deleteStmt.executeUpdate();
                }

                // 3. 画面上の数値をそのまま保存
                String insertSql = "INSERT INTO trip_budgets (trip_id, category, amount, is_return) VALUES (?, ?, ?, ?)";
                try (PreparedStatement ps = conn.prepareStatement(insertSql)) {
                    
                    // 🏨 宿泊・食費・その他 (is_return = 0)
                    saveItem(ps, tripId, "hotel", json.getInt("hotel"), 0);
                    saveItem(ps, tripId, "food", json.getInt("food"), 0);
                    saveItem(ps, tripId, "other", json.getInt("other"), 0);

                    // ⛽ 交通費（往路：is_return = 0）
                    int transOut = json.getInt("gasOut") + json.getInt("highwayOut");
                    saveItem(ps, tripId, "transport", transOut, 0);

                    // 🏎️ 交通費（復路：is_return = 1）
                    int transRet = json.getInt("gasReturn") + json.getInt("highwayReturn");
                    saveItem(ps, tripId, "transport", transRet, 1);

                    ps.executeBatch();
                }

                conn.commit();
                response.getWriter().write("{\"status\":\"success\"}");

            } catch (Exception e) {
                conn.rollback();
                throw e;
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(500);
            response.getWriter().write("{\"status\":\"error\"}");
        }
    }

    private void saveItem(PreparedStatement ps, int id, String cat, int amt, int isRet) throws Exception {
        ps.setInt(1, id);
        ps.setString(2, cat);
        ps.setInt(3, amt);
        ps.setInt(4, isRet);
        ps.addBatch();
    }
}