package modelother;

import java.io.Serializable;

/**
 * ユーザー情報を保持するモデルクラス
 * Serializableを実装することでセッション保存に対応させます
 */
public class User implements Serializable {
    private String userId;   // ユーザーID
    private String password; // パスワード

    // コンストラクタ（引数なし）
    public User() {}

    // コンストラクタ（全フィールド）
    public User(String userId, String password) {
        this.userId = userId;
        this.password = password;
    }

    // Getter & Setter
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}