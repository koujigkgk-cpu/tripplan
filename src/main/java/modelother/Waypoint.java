package modelother;

import java.io.Serializable;

/**
 * 経由地（ウェイポイント）を管理するモデルクラス
 */
public class Waypoint implements Serializable {
    private static final long serialVersionUID = 1L;

    private String name;
    private double lat;
    private double lng;
    private int stayTime;       // 滞在時間（分）
    private boolean isReturn;   // true:復路, false:往路
    private String description; // 予定の詳細（「ランチ, 買い物」など）
    
    // ★ 追加：DBの並び順を保持するフィールド
    private int sortOrder;

    // --- コンストラクタ ---
    public Waypoint() {}

    public Waypoint(String name, double lat, double lng) {
        this.name = name;
        this.lat = lat;
        this.lng = lng;
    }

    // --- Getter / Setter ---

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }

    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }

    public int getStayTime() { return stayTime; }
    public void setStayTime(int stayTime) { this.stayTime = stayTime; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    // ★ 追加：sortOrder の Getter/Setter
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }

    // Boolean型の標準的なGetter
    public boolean isReturn() { return isReturn; }
    public void setReturn(boolean isReturn) { this.isReturn = isReturn; }

    /**
     * DBの int値 (0 or 1) を受け取って boolean に変換してセットする
     * PlanDAO.java の取得処理で使用します
     */
    public void setIsReturn(int isReturnInt) {
        this.isReturn = (isReturnInt == 1);
    }
}