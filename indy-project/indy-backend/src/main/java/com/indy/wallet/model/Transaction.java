package com.indy.wallet.model;

public class Transaction {
    private long id;
    private String type; // "deposit", "withdraw", "interest"
    private String title;
    private double amount;
    private String date;
    private boolean isFresh;

    public Transaction() {}

    public Transaction(long id, String type, String title, double amount, String date, boolean isFresh) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.amount = amount;
        this.date = date;
        this.isFresh = isFresh;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public boolean isFresh() {
        return isFresh;
    }

    public void setFresh(boolean fresh) {
        isFresh = fresh;
    }
}
