package modelother;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class Plan implements Serializable {
	private static final long serialVersionUID = 1L;

	private int id;
	private String start; // DBのoriginに対応
	private String destination; // DBのdestinationに対応
	private String departureDate;
	private int totalBudget;

	// ★★★ 座標（DBに合わせてdouble型で定義） ★★★
	private double originLat;
	private double originLng;
	private double destLat;
	private double destLng;

	private int fuelCost;
	private int highwayFee;
	private double distanceKm;
	private String durationText;

	// --- 往路・復路の距離/時間 ---
	private double outboundDistanceKm;
	private String outboundDurationText;
	private double returnDistanceKm;
	private String returnDurationText;

	// --- 往路の費用内訳 ---
	private int hotelOutbound;
	private int foodOutbound;
	private int otherOutbound;
	private int transportOutbound;

	// --- 復路の費用内訳 ---
	private int hotelReturn;
	private int foodReturn;
	private int otherReturn;
	private int transportReturn;

	private List<Waypoint> waypoints = new ArrayList<>();

	public Plan() {
	}

	// --- Getter / Setter ---

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getStart() {
		return start;
	}

	public void setStart(String start) {
		this.start = start;
	}

	public String getDestination() {
		return destination;
	}

	public void setDestination(String destination) {
		this.destination = destination;
	}

	public String getDepartureDate() {
		return departureDate;
	}

	public void setDepartureDate(String departureDate) {
		this.departureDate = departureDate;
	}

	public int getTotalBudget() {
		return totalBudget;
	}

	public void setTotalBudget(int totalBudget) {
		this.totalBudget = totalBudget;
	}

	// ★ 座標のゲッター・セッター
	public double getOriginLat() {
		return originLat;
	}

	public void setOriginLat(double originLat) {
		this.originLat = originLat;
	}

	public double getOriginLng() {
		return originLng;
	}

	public void setOriginLng(double originLng) {
		this.originLng = originLng;
	}

	public double getDestLat() {
		return destLat;
	}

	public void setDestLat(double destLat) {
		this.destLat = destLat;
	}

	public double getDestLng() {
		return destLng;
	}

	public void setDestLng(double destLng) {
		this.destLng = destLng;
	}

	public int getFuelCost() {
		return fuelCost;
	}

	public void setFuelCost(int fuelCost) {
		this.fuelCost = fuelCost;
	}

	public int getHighwayFee() {
		return highwayFee;
	}

	public void setHighwayFee(int highwayFee) {
		this.highwayFee = highwayFee;
	}

	public double getDistanceKm() {
		return distanceKm;
	}

	public void setDistanceKm(double distanceKm) {
		this.distanceKm = distanceKm;
	}

	public String getDurationText() {
		return durationText;
	}

	public void setDurationText(String durationText) {
		this.durationText = durationText;
	}

	public double getOutboundDistanceKm() {
		return outboundDistanceKm;
	}

	public void setOutboundDistanceKm(double outboundDistanceKm) {
		this.outboundDistanceKm = outboundDistanceKm;
	}

	public String getOutboundDurationText() {
		return outboundDurationText;
	}

	public void setOutboundDurationText(String outboundDurationText) {
		this.outboundDurationText = outboundDurationText;
	}

	public double getReturnDistanceKm() {
		return returnDistanceKm;
	}

	public void setReturnDistanceKm(double returnDistanceKm) {
		this.returnDistanceKm = returnDistanceKm;
	}

	public String getReturnDurationText() {
		return returnDurationText;
	}

	public void setReturnDurationText(String returnDurationText) {
		this.returnDurationText = returnDurationText;
	}

	public int getHotelOutbound() {
		return hotelOutbound;
	}

	public void setHotelOutbound(int hotelOutbound) {
		this.hotelOutbound = hotelOutbound;
	}

	public int getFoodOutbound() {
		return foodOutbound;
	}

	public void setFoodOutbound(int foodOutbound) {
		this.foodOutbound = foodOutbound;
	}

	public int getOtherOutbound() {
		return otherOutbound;
	}

	public void setOtherOutbound(int otherOutbound) {
		this.otherOutbound = otherOutbound;
	}

	public int getTransportOutbound() {
		return transportOutbound;
	}

	public void setTransportOutbound(int transportOutbound) {
		this.transportOutbound = transportOutbound;
	}

	public int getHotelReturn() {
		return hotelReturn;
	}

	public void setHotelReturn(int hotelReturn) {
		this.hotelReturn = hotelReturn;
	}

	public int getFoodReturn() {
		return foodReturn;
	}

	public void setFoodReturn(int foodReturn) {
		this.foodReturn = foodReturn;
	}

	public int getOtherReturn() {
		return otherReturn;
	}

	public void setOtherReturn(int otherReturn) {
		this.otherReturn = otherReturn;
	}

	public int getTransportReturn() {
		return transportReturn;
	}

	public void setTransportReturn(int transportReturn) {
		this.transportReturn = transportReturn;
	}

	public List<Waypoint> getWaypoints() {
		return waypoints;
	}

	public void setWaypoints(List<Waypoint> waypoints) {
		this.waypoints = waypoints;
	}

}