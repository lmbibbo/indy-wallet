package com.indy.wallet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class WalletBalanceSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String uid;

    @Column(nullable = false)
    private double balance;

    private int simulatedDay;

    private LocalDateTime createdAt;

    public WalletBalanceSnapshot() {}

    public WalletBalanceSnapshot(String uid, double balance, int simulatedDay) {
        this.uid = uid;
        this.balance = balance;
        this.simulatedDay = simulatedDay;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }

    public double getBalance() { return balance; }
    public void setBalance(double balance) { this.balance = balance; }

    public int getSimulatedDay() { return simulatedDay; }
    public void setSimulatedDay(int simulatedDay) { this.simulatedDay = simulatedDay; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
