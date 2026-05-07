package modelother;

import java.io.Serializable;

public class Expense implements Serializable {
    private String category;
    private String itemName;
    private int price;
    private int isReturn;

    public Expense() {}

    // ゲッターとセッター
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public int getPrice() { return price; }
    public void setPrice(int price) { this.price = price; }

    public int getIsReturn() { return isReturn; }
    public void setIsReturn(int isReturn) { this.isReturn = isReturn; }
}