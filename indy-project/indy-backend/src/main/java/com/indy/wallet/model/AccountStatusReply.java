package com.indy.wallet.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AccountStatusReply {

    @JsonProperty("MSG")
    private String msg;

    @JsonProperty("BALANCE")
    private Double balance;

    @JsonProperty("EQUITY")
    private Double equity;

    @JsonProperty("PROFIT")
    private Double profit;

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
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
