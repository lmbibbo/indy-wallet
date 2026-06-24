package com.indy.wallet.service;

import com.indy.wallet.model.AccountStatusReply;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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
}
