package DAOother;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import modelother.User;

public class UserDAO {
    // データベース接続情報（ご自身の環境に合わせて password を書き換えてください）
    private final String URL = "jdbc:mysql://localhost:3306/tripplan_db?useSSL=false&allowPublicKeyRetrieval=true";
    private final String USER = "root";
    private final String PASS = "carp8912"; 

    /**
     * 新規ユーザーを登録する
     * @param id ユーザーID
     * @param pass パスワード
     * @return 成功ならtrue
     */
    public boolean registerUser(String id, String pass) {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = DriverManager.getConnection(URL, USER, PASS)) {
                String sql = "INSERT INTO users (user_id, password) VALUES (?, ?)";
                PreparedStatement pstmt = conn.prepareStatement(sql);
                pstmt.setString(1, id);
                pstmt.setString(2, pass);
                
                int result = pstmt.executeUpdate();
                return result > 0;
            }
        } catch (ClassNotFoundException | SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * ログイン時にユーザーを照会する
     * @param id 入力されたID
     * @param pass 入力されたパスワード
     * @return 一致するユーザーがいればUserオブジェクト、いなければnull
     */
    public User findByUser(String id, String pass) {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = DriverManager.getConnection(URL, USER, PASS)) {
                // IDとパスワードが両方一致するレコードを探す
                String sql = "SELECT user_id, password FROM users WHERE user_id = ? AND password = ?";
                PreparedStatement pstmt = conn.prepareStatement(sql);
                pstmt.setString(1, id);
                pstmt.setString(2, pass);
                
                ResultSet rs = pstmt.executeQuery();
                
                if (rs.next()) {
                    // 見つかった場合は、そのデータを持ったUserインスタンスを作って返す
                    return new User(
                        rs.getString("user_id"),
                        rs.getString("password")
                    );
                }
            }
        } catch (ClassNotFoundException | SQLException e) {
            e.printStackTrace();
        }
        // 見つからなかった場合
        return null;
    }
}