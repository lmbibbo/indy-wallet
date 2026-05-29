package com.indy.wallet.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class WalletState {
    @Id
    private String uid;
    private double balance;
    private double totalEarnings;
    private String currentStrategy;
    private double todayEarnings;
    private int simulatedDaysCount;

    public WalletState() {}

    public WalletState(String uid, double balance, double totalEarnings, String currentStrategy, double todayEarnings, int simulatedDaysCount) {
        this.uid = uid;
        this.balance = balance;
        this.totalEarnings = totalEarnings;
        this.currentStrategy = currentStrategy;
        this.todayEarnings = todayEarnings;
        this.simulatedDaysCount = simulatedDaysCount;
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }

    public double getTotalEarnings() {
        return totalEarnings;
    }

    public void setTotalEarnings(double totalEarnings) {
        this.totalEarnings = totalEarnings;
    }

    public String getCurrentStrategy() {
        return currentStrategy;
    }

    public void setCurrentStrategy(String currentStrategy) {
        this.currentStrategy = currentStrategy;
    }

    public double getTodayEarnings() {
        return todayEarnings;
    }

    public void setTodayEarnings(double todayEarnings) {
        this.todayEarnings = todayEarnings;
    }

    public int getSimulatedDaysCount() {
        return simulatedDaysCount;
    }

    public void setSimulatedDaysCount(int simulatedDaysCount) {
        this.simulatedDaysCount = simulatedDaysCount;
    }
}
