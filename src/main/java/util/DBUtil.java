package util; // パッケージ名はご自身の環境に合わせて調整してください

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBUtil {
    // データベース接続情報
    private static final String URL = "jdbc:mysql://localhost:3306/tripplan_db?serverTimezone=Asia/Tokyo";
    private static final String USER = "root"; // 設定したユーザー名
    private static final String PASS = "pass"; // 設定したパスワード

    public static Connection getConnection() throws SQLException {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
        return DriverManager.getConnection(URL, USER, PASS);
    }
}