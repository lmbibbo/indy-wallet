package com.indy.wallet.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String uid;
    private String type;
    private double amount;
    private double fundTotalAfter;
    private double userBalanceAfter;
    private double userPercentageAfter;
    private int day;
    private LocalDateTime timestamp;

    public Event() {}

    public Event(String uid, String type, double amount, double fundTotalAfter,
                 double userBalanceAfter, double userPercentageAfter, int day) {
        this.uid = uid;
        this.type = type;
        this.amount = amount;
        this.fundTotalAfter = fundTotalAfter;
        this.userBalanceAfter = userBalanceAfter;
        this.userPercentageAfter = userPercentageAfter;
        this.day = day;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public double getFundTotalAfter() { return fundTotalAfter; }
    public void setFundTotalAfter(double fundTotalAfter) { this.fundTotalAfter = fundTotalAfter; }
    public double getUserBalanceAfter() { return userBalanceAfter; }
    public void setUserBalanceAfter(double userBalanceAfter) { this.userBalanceAfter = userBalanceAfter; }
    public double getUserPercentageAfter() { return userPercentageAfter; }
    public void setUserPercentageAfter(double userPercentageAfter) { this.userPercentageAfter = userPercentageAfter; }
    public int getDay() { return day; }
    public void setDay(int day) { this.day = day; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
