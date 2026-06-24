package com.indy.wallet.service;

import com.indy.wallet.model.AccountBalanceHistory;
import com.indy.wallet.model.AccountStatusReply;
import com.indy.wallet.repository.AccountBalanceHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@ConditionalOnProperty(value = "investment.tracking.enabled", havingValue = "true")
public class InvestmentTrackingService {

    private static final Logger logger = LoggerFactory.getLogger(InvestmentTrackingService.class);

    private final MtSocketApiClient mtSocketApiClient;
    private final AccountBalanceHistoryRepository repository;

    public InvestmentTrackingService(MtSocketApiClient mtSocketApiClient, AccountBalanceHistoryRepository repository) {
        this.mtSocketApiClient = mtSocketApiClient;
        this.repository = repository;
    }

    // Ejecuta cada hora (3600000 ms). Se puede ajustar a conveniencia.
    @Scheduled(fixedRate = 3600000)
    public void trackInvestmentEvolution() {
        logger.info("Fetching account status from MTsocketAPI...");
        AccountStatusReply status = mtSocketApiClient.getAccountStatus();

        if (status != null && status.getBalance() != null) {
            AccountBalanceHistory history = new AccountBalanceHistory(
                    LocalDateTime.now(),
                    status.getBalance(),
                    status.getEquity(),
                    status.getProfit()
            );
            repository.save(history);
            logger.info("Account balance saved: Balance={}, Equity={}, Profit={}", 
                        status.getBalance(), status.getEquity(), status.getProfit());
        } else {
            logger.warn("Failed to fetch account status or balance is null.");
        }
    }
}
