package com.indy.wallet.service;

import com.indy.wallet.model.AccountStatusReply;
import com.indy.wallet.model.Strategy;
import com.indy.wallet.model.Transaction;
import com.indy.wallet.model.WalletState;
import com.indy.wallet.repository.TransactionRepository;
import com.indy.wallet.repository.WalletStateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class WalletService {

    private static final Logger logger = LoggerFactory.getLogger(WalletService.class);

    private final WalletStateRepository walletStateRepository;
    private final TransactionRepository transactionRepository;
    private final MtSocketApiClient mtSocketApiClient;
    private final DateTimeFormatter dateFormatter;

    public WalletService(WalletStateRepository walletStateRepository,
                         TransactionRepository transactionRepository,
                         MtSocketApiClient mtSocketApiClient) {
        this.walletStateRepository = walletStateRepository;
        this.transactionRepository = transactionRepository;
        this.mtSocketApiClient = mtSocketApiClient;
        this.dateFormatter = DateTimeFormatter.ofPattern("dd 'de' MMM, yyyy", Locale.forLanguageTag("es-AR"));
    }

    private WalletState initializeUserIfNeeded(String uid) {
        return walletStateRepository.findById(uid).orElseGet(() -> {
            WalletState state = new WalletState(uid, 0.00, 0.00, "conservative", 0.000000, 0);
            return walletStateRepository.save(state);
        });
    }

    private String getFormattedDate(int daysOffset) {
        LocalDate date = LocalDate.now().plusDays(daysOffset);
        return date.format(dateFormatter);
    }

    public WalletState getStatus(String uid) {
        WalletState state = initializeUserIfNeeded(uid);

        // Obtener el balance real de la cuenta de MetaTrader
        try {
            AccountStatusReply accountStatus = mtSocketApiClient.getAccountStatus();
            if (accountStatus != null && accountStatus.getBalance() != null) {
                state.setBalance(accountStatus.getBalance());
                logger.info("Balance de MetaTrader obtenido: {}", accountStatus.getBalance());
            } else {
                logger.warn("No se pudo obtener el balance de MetaTrader. Usando balance local.");
            }
        } catch (Exception e) {
            logger.error("Error al conectar con MTsocketAPI: {}. Usando balance local.", e.getMessage());
        }

        return state;
    }

    public List<Transaction> getTransactions(String uid) {
        initializeUserIfNeeded(uid);
        return transactionRepository.findByUidOrderByIdDesc(uid);
    }

    @Transactional
    public WalletState deposit(String uid, double amount) {
        WalletState state = initializeUserIfNeeded(uid);
        if (amount <= 0) {
            throw new IllegalArgumentException("El monto a ingresar debe ser mayor que cero.");
        }
        
        state.setBalance(state.getBalance() + amount);
        walletStateRepository.save(state);
        
        Transaction tx = new Transaction(
            uid,
            "deposit",
            "Depósito de Fondos",
            amount,
            getFormattedDate(state.getSimulatedDaysCount()),
            true
        );
        transactionRepository.save(tx);
        
        return state;
    }

    @Transactional
    public WalletState withdraw(String uid, double amount) {
        WalletState state = initializeUserIfNeeded(uid);
        if (amount <= 0) {
            throw new IllegalArgumentException("El monto a retirar debe ser mayor que cero.");
        }

        if (amount > state.getBalance()) {
            throw new IllegalArgumentException("Saldo insuficiente para realizar esta extracción.");
        }

        state.setBalance(state.getBalance() - amount);
        walletStateRepository.save(state);
        
        Transaction tx = new Transaction(
            uid,
            "withdraw",
            "Extracción de Fondos",
            amount,
            getFormattedDate(state.getSimulatedDaysCount()),
            true
        );
        transactionRepository.save(tx);
        
        return state;
    }

    @Transactional
    public WalletState setStrategy(String uid, String strategyName) {
        WalletState state = initializeUserIfNeeded(uid);
        try {
            Strategy.valueOf(strategyName.toUpperCase());
            state.setCurrentStrategy(strategyName.toLowerCase());
            return walletStateRepository.save(state);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Estrategia de inversión inválida: " + strategyName);
        }
    }

    @Transactional
    public void simulateDayForAllUsers() {
        List<WalletState> allUsers = walletStateRepository.findAll();
        for (WalletState state : allUsers) {
            simulateDayForUser(state);
        }
    }

    private void simulateDayForUser(WalletState state) {
        Strategy strategy = Strategy.valueOf(state.getCurrentStrategy().toUpperCase());
        
        double dailyYieldRate = strategy.getDailyRate();
        
        if (strategy.getVolatility() > 0.0) {
            double fluctuation = (Math.random() - 0.5) * 2.0 * strategy.getVolatility();
            dailyYieldRate += fluctuation;
        }

        double earningsToday = state.getBalance() * dailyYieldRate;
        
        state.setBalance(state.getBalance() + earningsToday);
        state.setTotalEarnings(state.getTotalEarnings() + earningsToday);
        state.setSimulatedDaysCount(state.getSimulatedDaysCount() + 1);
        state.setTodayEarnings(0.0);

        walletStateRepository.save(state);

        String titleSuffix = "";
        if (strategy == Strategy.MODERATE) {
            titleSuffix = " (Fondo Mixto)";
        } else if (strategy == Strategy.AGGRESSIVE) {
            titleSuffix = earningsToday >= 0 ? " (Crypto Alza 🚀)" : " (Corrección de Mercado 📉)";
        }

        Transaction tx = new Transaction(
            state.getUid(),
            "interest",
            "Acreditación Diaria Rendimiento" + titleSuffix,
            earningsToday,
            getFormattedDate(state.getSimulatedDaysCount()),
            true
        );
        transactionRepository.save(tx);
    }

    public List<Map<String, Object>> getProjection(String uid, int days) {
        WalletState state = initializeUserIfNeeded(uid);
        if (days <= 0) {
            throw new IllegalArgumentException("El horizonte de días debe ser mayor a cero.");
        }
        
        Strategy strategy = Strategy.valueOf(state.getCurrentStrategy().toUpperCase());
        double base = state.getBalance();
        
        List<Map<String, Object>> projectionPoints = new ArrayList<>();
        double tempBalance = base;

        Map<String, Object> initialPoint = new HashMap<>();
        initialPoint.put("day", 0);
        initialPoint.put("label", "Hoy");
        initialPoint.put("balance", base);
        initialPoint.put("earnings", 0.0);
        projectionPoints.add(initialPoint);

        for (int i = 1; i <= days; i++) {
            tempBalance = tempBalance * (1.0 + strategy.getDailyRate());
            
            boolean shouldAddPoint = false;
            if (days <= 30) {
                shouldAddPoint = true;
            } else if (days <= 100) {
                shouldAddPoint = (i % 5 == 0 || i == days);
            } else {
                shouldAddPoint = (i % 15 == 0 || i == days);
            }

            if (shouldAddPoint) {
                Map<String, Object> point = new HashMap<>();
                point.put("day", i);
                point.put("label", "Día " + i);
                point.put("balance", tempBalance);
                point.put("earnings", tempBalance - base);
                projectionPoints.add(point);
            }
        }

        return projectionPoints;
    }
}
