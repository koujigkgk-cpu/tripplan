package modelother;

import java.io.Serializable;
import java.time.LocalDate;

public class Trip implements Serializable {
    private int id;
    private String origin;
    private String destination;
    private LocalDate departureDate;
    private int totalBudget;
    private int fuelCost;
    private int highwayFee;
    private double distanceKm;
    private String durationText;
    private double outboundDistanceKm;
    private String outboundDurationText;
    private double returnDistanceKm;
    private String returnDurationText;
    private double originLat;
    private double originLng;
    private double destLat;
    private double destLng;

    public Trip() {}

    // 全項目対応コンストラクタ
    public Trip(int id, String origin, String destination, LocalDate departureDate, int totalBudget,
                int fuelCost, int highwayFee, double distanceKm, String durationText,
                double outboundDistanceKm, String outboundDurationText, double returnDistanceKm, String returnDurationText,
                double originLat, double originLng, double destLat, double destLng) {
        this.id = id;
        this.origin = origin;
        this.destination = destination;
        this.departureDate = departureDate;
        this.totalBudget = totalBudget;
        this.fuelCost = fuelCost;
        this.highwayFee = highwayFee;
        this.distanceKm = distanceKm;
        this.durationText = durationText;
        this.outboundDistanceKm = outboundDistanceKm;
        this.outboundDurationText = outboundDurationText;
        this.returnDistanceKm = returnDistanceKm;
        this.returnDurationText = returnDurationText;
        this.originLat = originLat;
        this.originLng = originLng;
        this.destLat = destLat;
        this.destLng = destLng;
    }

    // Getter / Setter
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public LocalDate getDepartureDate() { return departureDate; }
    public void setDepartureDate(LocalDate departureDate) { this.departureDate = departureDate; }
    public int getTotalBudget() { return totalBudget; }
    public void setTotalBudget(int totalBudget) { this.totalBudget = totalBudget; }
    public int getFuelCost() { return fuelCost; }
    public void setFuelCost(int fuelCost) { this.fuelCost = fuelCost; }
    public int getHighwayFee() { return highwayFee; }
    public void setHighwayFee(int highwayFee) { this.highwayFee = highwayFee; }
    public double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }
    public String getDurationText() { return durationText; }
    public void setDurationText(String durationText) { this.durationText = durationText; }
    public double getOutboundDistanceKm() { return outboundDistanceKm; }
    public void setOutboundDistanceKm(double outboundDistanceKm) { this.outboundDistanceKm = outboundDistanceKm; }
    public String getOutboundDurationText() { return outboundDurationText; }
    public void setOutboundDurationText(String outboundDurationText) { this.outboundDurationText = outboundDurationText; }
    public double getReturnDistanceKm() { return returnDistanceKm; }
    public void setReturnDistanceKm(double returnDistanceKm) { this.returnDistanceKm = returnDistanceKm; }
    public String getReturnDurationText() { return returnDurationText; }
    public void setReturnDurationText(String returnDurationText) { this.returnDurationText = returnDurationText; }
    public double getOriginLat() { return originLat; }
    public void setOriginLat(double originLat) { this.originLat = originLat; }
    public double getOriginLng() { return originLng; }
    public void setOriginLng(double originLng) { this.originLng = originLng; }
    public double getDestLat() { return destLat; }
    public void setDestLat(double destLat) { this.destLat = destLat; }
    public double getDestLng() { return destLng; }
    public void setDestLng(double destLng) { this.destLng = destLng; }
}