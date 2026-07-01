package com.indy.wallet.service;

import com.indy.wallet.model.AccountStatusReply;
import com.indy.wallet.model.FondoComun;
import com.indy.wallet.repository.FondoComunRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;

@Service
public class MtPollingService {

    private static final Logger logger = LoggerFactory.getLogger(MtPollingService.class);

    private final MtSocketApiClient mtSocketApiClient;
    private final FondoComunRepository fondoComunRepository;

    @Value("${mtsocket.poll.interval.ms:120000}")
    private long pollIntervalMs;

    public MtPollingService(MtSocketApiClient mtSocketApiClient,
                            FondoComunRepository fondoComunRepository) {
        this.mtSocketApiClient = mtSocketApiClient;
        this.fondoComunRepository = fondoComunRepository;
    }

    @PostConstruct
    void logConfig() {
        logger.info("MT4 polling started — cada {}ms", pollIntervalMs);
    }

    @Scheduled(fixedDelayString = "${mtsocket.poll.interval.ms}")
    public void pollMtAndUpdateFund() {
        AccountStatusReply status = mtSocketApiClient.getAccountStatus();
        if (status == null || status.getBalance() == null) {
            logger.debug("MT4 polling: no se pudo obtener estado");
            return;
        }

        var all = fondoComunRepository.findAll();
        if (all.isEmpty()) {
            logger.debug("MT4 polling: FondoComun aún no existe, omitiendo");
            return;
        }

        FondoComun fund = all.get(0);
        double oldValue = fund.getTotalValue();
        double newValue = status.getBalance();

        if (Math.abs(newValue - oldValue) > 0.001) {
            fund.setTotalValue(newValue);
            fund.setLastUpdated(LocalDateTime.now());
            fondoComunRepository.save(fund);
            logger.info("MT4 polling: fondo actualizado ${} -> ${}", oldValue, newValue);
        } else {
            logger.debug("MT4 polling: sin cambios (${})", oldValue);
        }
    }
}
