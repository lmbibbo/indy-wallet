package com.indy.wallet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "account_balance_history")
public class AccountBalanceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private Double balance;

    @Column(nullable = false)
    private Double equity;

    @Column(nullable = false)
    private Double profit;

    public AccountBalanceHistory() {
    }

    public AccountBalanceHistory(LocalDateTime timestamp, Double balance, Double equity, Double profit) {
        this.timestamp = timestamp;
        this.balance = balance;
        this.equity = equity;
        this.profit = profit;
    }

    public Long getId() {
        return id;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }

    public Double getEquity() {
        return equity;
    }

    public void setEquity(Double equity) {
        this.equity = equity;
    }

    public Double getProfit() {
        return profit;
    }

    public void setProfit(Double profit) {
        this.profit = profit;
    }
}
