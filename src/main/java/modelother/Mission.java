package modelother;

import java.io.Serializable;

public class Mission implements Serializable {
    private int id;
    private int tripId;
    private String title;
    private String category;
    private boolean isCompleted; // true(1)なら成功、false(0)なら未達成

    public Mission() {}

    // コンストラクタ
    public Mission(int id, int tripId, String title, String category, boolean isCompleted) {
        this.id = id;
        this.tripId = tripId;
        this.title = title;
        this.category = category;
        this.isCompleted = isCompleted;
    }

    // Getter / Setter
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getTripId() { return tripId; }
    public void setTripId(int tripId) { this.tripId = tripId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean isCompleted) { this.isCompleted = isCompleted; }
}