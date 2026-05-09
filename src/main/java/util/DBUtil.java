package util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBUtil {
    // Renderの設定画面(Environment Variables)から値を読み込むように変更
    private static final String URL = System.getenv("DB_URL");
    private static final String USER = System.getenv("DB_USER");
    private static final String PASS = System.getenv("DB_PASS");

    public static Connection getConnection() throws SQLException {
        try {
            // PostgreSQL用のドライバーを読み込む
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
        // 環境変数から取得したURL、USER、PASSを使って接続
        return DriverManager.getConnection(URL, USER, PASS);
    }
}