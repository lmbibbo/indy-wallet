package com.indy.wallet.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AccountStatusReply {

    @JsonProperty("MSG")
    private String msg;

    @JsonProperty("COMPANY")
    private String company;

    @JsonProperty("CURRENCY")
    private String currency;

    @JsonProperty("NAME")
    private String name;

    @JsonProperty("SERVER")
    private String server;

    @JsonProperty("LOGIN")
    private Long login;

    @JsonProperty("TRADE_MODE")
    private Integer tradeMode;

    @JsonProperty("LEVERAGE")
    private Integer leverage;

    @JsonProperty("LIMIT_ORDERS")
    private Integer limitOrders;

    @JsonProperty("MARGIN_SO_MODE")
    private Integer marginSoMode;

    @JsonProperty("TRADE_ALLOWED")
    private Integer tradeAllowed;

    @JsonProperty("TRADE_EXPERT")
    private Integer tradeExpert;

    @JsonProperty("BALANCE")
    private Double balance;

    @JsonProperty("CREDIT")
    private Double credit;

    @JsonProperty("PROFIT")
    private Double profit;

    @JsonProperty("EQUITY")
    private Double equity;

    @JsonProperty("MARGIN")
    private Double margin;

    @JsonProperty("MARGIN_FREE")
    private Double marginFree;

    @JsonProperty("MARGIN_LEVEL")
    private Double marginLevel;

    @JsonProperty("MARGIN_SO_CAL")
    private Double marginSoCal;

    @JsonProperty("MARGIN_SO_SO")
    private Double marginSoSo;

    @JsonProperty("ERROR_ID")
    private Integer errorId;

    @JsonProperty("ERROR_DESCRIPTION")
    private String errorDescription;

    @JsonProperty("DEMO")
    private String demo;

    public String getMsg() { return msg; }
    public void setMsg(String msg) { this.msg = msg; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getServer() { return server; }
    public void setServer(String server) { this.server = server; }

    public Long getLogin() { return login; }
    public void setLogin(Long login) { this.login = login; }

    public Integer getTradeMode() { return tradeMode; }
    public void setTradeMode(Integer tradeMode) { this.tradeMode = tradeMode; }

    public Integer getLeverage() { return leverage; }
    public void setLeverage(Integer leverage) { this.leverage = leverage; }

    public Integer getLimitOrders() { return limitOrders; }
    public void setLimitOrders(Integer limitOrders) { this.limitOrders = limitOrders; }

    public Integer getMarginSoMode() { return marginSoMode; }
    public void setMarginSoMode(Integer marginSoMode) { this.marginSoMode = marginSoMode; }

    public Integer getTradeAllowed() { return tradeAllowed; }
    public void setTradeAllowed(Integer tradeAllowed) { this.tradeAllowed = tradeAllowed; }

    public Integer getTradeExpert() { return tradeExpert; }
    public void setTradeExpert(Integer tradeExpert) { this.tradeExpert = tradeExpert; }

    public Double getBalance() { return balance; }
    public void setBalance(Double balance) { this.balance = balance; }

    public Double getCredit() { return credit; }
    public void setCredit(Double credit) { this.credit = credit; }

    public Double getProfit() { return profit; }
    public void setProfit(Double profit) { this.profit = profit; }

    public Double getEquity() { return equity; }
    public void setEquity(Double equity) { this.equity = equity; }

    public Double getMargin() { return margin; }
    public void setMargin(Double margin) { this.margin = margin; }

    public Double getMarginFree() { return marginFree; }
    public void setMarginFree(Double marginFree) { this.marginFree = marginFree; }

    public Double getMarginLevel() { return marginLevel; }
    public void setMarginLevel(Double marginLevel) { this.marginLevel = marginLevel; }

    public Double getMarginSoCal() { return marginSoCal; }
    public void setMarginSoCal(Double marginSoCal) { this.marginSoCal = marginSoCal; }

    public Double getMarginSoSo() { return marginSoSo; }
    public void setMarginSoSo(Double marginSoSo) { this.marginSoSo = marginSoSo; }

    public Integer getErrorId() { return errorId; }
    public void setErrorId(Integer errorId) { this.errorId = errorId; }

    public String getErrorDescription() { return errorDescription; }
    public void setErrorDescription(String errorDescription) { this.errorDescription = errorDescription; }

    public String getDemo() { return demo; }
    public void setDemo(String demo) { this.demo = demo; }
}
