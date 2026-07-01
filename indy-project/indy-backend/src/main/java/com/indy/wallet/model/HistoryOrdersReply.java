package com.indy.wallet.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class HistoryOrdersReply {

    @JsonProperty("MSG")
    private String msg;

    @JsonProperty("TRADES")
    private List<Trade> trades;

    @JsonProperty("ERROR_ID")
    private Integer errorId;

    @JsonProperty("ERROR_DESCRIPTION")
    private String errorDescription;

    public String getMsg() { return msg; }
    public void setMsg(String msg) { this.msg = msg; }
    public List<Trade> getTrades() { return trades; }
    public void setTrades(List<Trade> trades) { this.trades = trades; }
    public Integer getErrorId() { return errorId; }
    public void setErrorId(Integer errorId) { this.errorId = errorId; }
    public String getErrorDescription() { return errorDescription; }
    public void setErrorDescription(String errorDescription) { this.errorDescription = errorDescription; }

    public static class Trade {

        @JsonProperty("TICKET")
        private Long ticket;

        @JsonProperty("SYMBOL")
        private String symbol;

        @JsonProperty("TYPE")
        private String type;

        @JsonProperty("LOTS")
        private Double lots;

        @JsonProperty("OPEN_TIME")
        private String openTime;

        @JsonProperty("CLOSE_TIME")
        private String closeTime;

        @JsonProperty("PRICE_OPEN")
        private Double priceOpen;

        @JsonProperty("PRICE_CLOSE")
        private Double priceClose;

        @JsonProperty("PROFIT")
        private Double profit;

        @JsonProperty("SWAP")
        private Double swap;

        @JsonProperty("COMMISSION")
        private Double commission;

        @JsonProperty("COMMENT")
        private String comment;

        @JsonProperty("MAGIC")
        private Long magic;

        @JsonProperty("STOP_LOSS")
        private Double stopLoss;

        @JsonProperty("TAKE_PROFIT")
        private Double takeProfit;

        public Long getTicket() { return ticket; }
        public void setTicket(Long ticket) { this.ticket = ticket; }
        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Double getLots() { return lots; }
        public void setLots(Double lots) { this.lots = lots; }
        public String getOpenTime() { return openTime; }
        public void setOpenTime(String openTime) { this.openTime = openTime; }
        public String getCloseTime() { return closeTime; }
        public void setCloseTime(String closeTime) { this.closeTime = closeTime; }
        public Double getPriceOpen() { return priceOpen; }
        public void setPriceOpen(Double priceOpen) { this.priceOpen = priceOpen; }
        public Double getPriceClose() { return priceClose; }
        public void setPriceClose(Double priceClose) { this.priceClose = priceClose; }
        public Double getProfit() { return profit; }
        public void setProfit(Double profit) { this.profit = profit; }
        public Double getSwap() { return swap; }
        public void setSwap(Double swap) { this.swap = swap; }
        public Double getCommission() { return commission; }
        public void setCommission(Double commission) { this.commission = commission; }
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
        public Long getMagic() { return magic; }
        public void setMagic(Long magic) { this.magic = magic; }
        public Double getStopLoss() { return stopLoss; }
        public void setStopLoss(Double stopLoss) { this.stopLoss = stopLoss; }
        public Double getTakeProfit() { return takeProfit; }
        public void setTakeProfit(Double takeProfit) { this.takeProfit = takeProfit; }
    }
}
