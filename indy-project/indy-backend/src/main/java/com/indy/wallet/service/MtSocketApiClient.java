package com.indy.wallet.service;

import com.indy.wallet.model.AccountStatusReply;
import com.indy.wallet.model.HistoryOrdersReply;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class MtSocketApiClient {

    private static final Logger logger = LoggerFactory.getLogger(MtSocketApiClient.class);

    private final RestTemplate restTemplate;

    @Value("${mtsocket.api.url:http://localhost:81}")
    private String apiUrl;

    public MtSocketApiClient() {
        this.restTemplate = new RestTemplate();
    }

    public AccountStatusReply getAccountStatus() {
        String url = apiUrl + "/v1/account";
        try {
            return restTemplate.getForObject(url, AccountStatusReply.class);
        } catch (Exception e) {
            logger.warn("Error al conectar con MTsocketAPI en {}: {}", url, e.getMessage());
            return null;
        }
    }

    public HistoryOrdersReply getHistoryOrders(String fromDate, String toDate) {
        String url = String.format("%s/v1/history/orders?from_date=%s&to_date=%s", apiUrl, fromDate, toDate);
        try {
            return restTemplate.getForObject(url, HistoryOrdersReply.class);
        } catch (Exception e) {
            logger.warn("Error al obtener historial de MTsocketAPI en {}: {}", url, e.getMessage());
            return null;
        }
    }

    public HistoryOrdersReply getHistoryOrdersForDay(LocalDate date) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy.MM.dd");
        return getHistoryOrders(date.format(fmt), date.format(fmt));
    }

    public double getDailyProfit(LocalDate date) {
        HistoryOrdersReply reply = getHistoryOrdersForDay(date);
        if (reply == null || reply.getTrades() == null) return 0.0;
        return reply.getTrades().stream()
                .filter(t -> t.getProfit() != null)
                .mapToDouble(HistoryOrdersReply.Trade::getProfit)
                .sum();
    }
}
