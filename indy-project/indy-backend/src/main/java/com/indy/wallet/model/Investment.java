package com.indy.wallet.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class Investment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String uid;
    private double amount;
    private String strategy;
    private LocalDateTime startDate;
    private double currentValue;
    private String status;
    private double totalReturns;

    public Investment() {}

    public Investment(String uid, double amount, String strategy) {
        this.uid = uid;
        this.amount = amount;
        this.strategy = strategy;
        this.startDate = LocalDateTime.now();
        this.currentValue = amount;
        this.status = "active";
        this.totalReturns = 0.0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public String getStrategy() { return strategy; }
    public void setStrategy(String strategy) { this.strategy = strategy; }
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    public double getCurrentValue() { return currentValue; }
    public void setCurrentValue(double currentValue) { this.currentValue = currentValue; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public double getTotalReturns() { return totalReturns; }
    public void setTotalReturns(double totalReturns) { this.totalReturns = totalReturns; }
}
