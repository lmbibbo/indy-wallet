package com.indy.wallet.service;

import com.indy.wallet.model.AccountStatusReply;
import com.indy.wallet.model.Strategy;
import com.indy.wallet.model.Transaction;
import com.indy.wallet.model.WalletBalanceSnapshot;
import com.indy.wallet.model.WalletState;
import com.indy.wallet.repository.TransactionRepository;
import com.indy.wallet.repository.WalletBalanceSnapshotRepository;
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
    private final WalletBalanceSnapshotRepository balanceSnapshotRepository;
    private final MtSocketApiClient mtSocketApiClient;
    private final DateTimeFormatter dateFormatter;

    public WalletService(WalletStateRepository walletStateRepository,
                         TransactionRepository transactionRepository,
                         WalletBalanceSnapshotRepository balanceSnapshotRepository,
                         MtSocketApiClient mtSocketApiClient) {
        this.walletStateRepository = walletStateRepository;
        this.transactionRepository = transactionRepository;
        this.balanceSnapshotRepository = balanceSnapshotRepository;
        this.mtSocketApiClient = mtSocketApiClient;
        this.dateFormatter = DateTimeFormatter.ofPattern("dd 'de' MMM, yyyy", Locale.forLanguageTag("es-AR"));
    }

    private WalletState initializeUserIfNeeded(String uid) {
        return walletStateRepository.findById(uid).orElseGet(() -> {
            WalletState state = new WalletState(uid, 0.00, 0.00, 0.00, "conservative", 0.000000, 0);
            WalletState saved = walletStateRepository.save(state);
            balanceSnapshotRepository.save(new WalletBalanceSnapshot(uid, 0.00, 0));
            return saved;
        });
    }

    private void saveBalanceSnapshot(String uid, int simulatedDay) {
        WalletState state = walletStateRepository.findById(uid).orElse(null);
        if (state == null) return;
        WalletBalanceSnapshot snapshot = new WalletBalanceSnapshot(uid, state.getBalance(), simulatedDay);
        balanceSnapshotRepository.save(snapshot);
    }

    private Map<String, Object> getBalanceDaysAgo(String uid, int daysAgo) {
        WalletState state = walletStateRepository.findById(uid).orElse(null);
        if (state == null) return Map.of("balance", 0.0, "simulatedDay", 0);
        int targetDay = Math.max(0, state.getSimulatedDaysCount() - daysAgo);
        return balanceSnapshotRepository
            .findTopByUidAndSimulatedDayLessThanEqualOrderBySimulatedDayDescCreatedAtDesc(uid, targetDay)
            .map(s -> Map.<String, Object>of("balance", s.getBalance(), "simulatedDay", s.getSimulatedDay()))
            .orElseGet(() -> {
                WalletBalanceSnapshot first = balanceSnapshotRepository
                    .findTopByUidAndSimulatedDayOrderByCreatedAtDesc(uid, 0)
                    .orElse(null);
                return first != null
                    ? Map.of("balance", first.getBalance(), "simulatedDay", first.getSimulatedDay())
                    : Map.of("balance", 0.0, "simulatedDay", 0);
            });
    }

    private String getFormattedDate(int daysOffset) {
        LocalDate date = LocalDate.now().plusDays(daysOffset);
        return date.format(dateFormatter);
    }

    public Map<String, Object> getStatus(String uid) {
        WalletState state = initializeUserIfNeeded(uid);
        boolean mtConnected = false;
        Double mtBalance = null;

        try {
            AccountStatusReply accountStatus = mtSocketApiClient.getAccountStatus();
            if (accountStatus != null && accountStatus.getBalance() != null) {
                mtConnected = true;
                mtBalance = accountStatus.getBalance();
                logger.info("MetaTrader conectado. Balance MT4: {}", mtBalance);
            } else {
                logger.warn("MetaTrader no responde. Usando balance local de DB.");
            }
        } catch (Exception e) {
            logger.warn("MetaTrader desconectado: {}. Usando balance local de DB.", e.getMessage());
        }

        Map<String, Object> balance30dInfo = getBalanceDaysAgo(uid, 30);
        double balance30dAgo = (double) balance30dInfo.get("balance");
        int balance30dDay = (int) balance30dInfo.get("simulatedDay");
        String balance30dDate = LocalDate.now().minusDays(30).format(dateFormatter);

        Map<String, Object> result = new HashMap<>();
        result.put("uid", state.getUid());
        result.put("balance", state.getBalance());
        result.put("mtBalance", mtBalance);
        result.put("balance30dAgo", balance30dAgo);
        result.put("balance30dDay", balance30dDay);
        result.put("balance30dDate", balance30dDate);
        result.put("investedAmount", state.getInvestedAmount());
        result.put("totalEarnings", state.getTotalEarnings());
        result.put("currentStrategy", state.getCurrentStrategy());
        result.put("todayEarnings", state.getTodayEarnings());
        result.put("simulatedDaysCount", state.getSimulatedDaysCount());
        result.put("mtConnected", mtConnected);
        return result;
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
        
        saveBalanceSnapshot(uid, state.getSimulatedDaysCount());

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
        
        saveBalanceSnapshot(uid, state.getSimulatedDaysCount());

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
    public WalletState withdrawInvested(String uid, double amount) {
        WalletState state = initializeUserIfNeeded(uid);
        if (amount <= 0) {
            throw new IllegalArgumentException("El monto a retirar debe ser mayor que cero.");
        }
        if (amount > state.getInvestedAmount()) {
            throw new IllegalArgumentException("Monto invertido insuficiente. Invertido: $" + String.format("%.2f", state.getInvestedAmount()));
        }
        state.setInvestedAmount(state.getInvestedAmount() - amount);
        state.setBalance(state.getBalance() + amount);
        walletStateRepository.save(state);

        Transaction tx = new Transaction(
            uid,
            "withdraw",
            "Retiro de Inversión",
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
        saveBalanceSnapshot(state.getUid(), state.getSimulatedDaysCount());

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
