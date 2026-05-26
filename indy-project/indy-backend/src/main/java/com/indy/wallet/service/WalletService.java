package com.indy.wallet.service;

import com.indy.wallet.model.Strategy;
import com.indy.wallet.model.Transaction;
import com.indy.wallet.model.WalletState;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class WalletService {
    
    private final Map<String, WalletState> userStates;
    private final Map<String, List<Transaction>> userTransactions;
    private final DateTimeFormatter dateFormatter;

    public WalletService() {
        this.dateFormatter = DateTimeFormatter.ofPattern("dd 'de' MMM, yyyy", Locale.forLanguageTag("es-AR"));
        this.userStates = new ConcurrentHashMap<>();
        this.userTransactions = new ConcurrentHashMap<>();
    }

    private void initializeUserIfNeeded(String uid) {
        if (!userStates.containsKey(uid)) {
            WalletState state = new WalletState(150000.00, 0.00, "conservative", 0.000000, 0);
            userStates.put(uid, state);
            
            List<Transaction> transactions = new CopyOnWriteArrayList<>();
            transactions.add(new Transaction(
                1L,
                "deposit",
                "Depósito Inicial",
                150000.00,
                getFormattedDate(0),
                false
            ));
            userTransactions.put(uid, transactions);
        }
    }

    private String getFormattedDate(int daysOffset) {
        LocalDate date = LocalDate.now().plusDays(daysOffset);
        return date.format(dateFormatter);
    }

    public WalletState getStatus(String uid) {
        initializeUserIfNeeded(uid);
        return userStates.get(uid);
    }

    public List<Transaction> getTransactions(String uid) {
        initializeUserIfNeeded(uid);
        return userTransactions.get(uid);
    }

    public synchronized WalletState deposit(String uid, double amount) {
        initializeUserIfNeeded(uid);
        if (amount <= 0) {
            throw new IllegalArgumentException("El monto a ingresar debe ser mayor que cero.");
        }
        
        WalletState state = userStates.get(uid);
        List<Transaction> transactions = userTransactions.get(uid);

        state.setBalance(state.getBalance() + amount);
        
        Transaction tx = new Transaction(
            transactions.size() + 1,
            "deposit",
            "Depósito de Fondos",
            amount,
            getFormattedDate(state.getSimulatedDaysCount()),
            true
        );
        transactions.add(0, tx); // Añadir al inicio
        
        return state;
    }

    public synchronized WalletState withdraw(String uid, double amount) {
        initializeUserIfNeeded(uid);
        if (amount <= 0) {
            throw new IllegalArgumentException("El monto a retirar debe ser mayor que cero.");
        }

        WalletState state = userStates.get(uid);
        List<Transaction> transactions = userTransactions.get(uid);

        if (amount > state.getBalance()) {
            throw new IllegalArgumentException("Saldo insuficiente para realizar esta extracción.");
        }

        state.setBalance(state.getBalance() - amount);
        
        Transaction tx = new Transaction(
            transactions.size() + 1,
            "withdraw",
            "Extracción de Fondos",
            amount,
            getFormattedDate(state.getSimulatedDaysCount()),
            true
        );
        transactions.add(0, tx); // Añadir al inicio
        
        return state;
    }

    public synchronized WalletState setStrategy(String uid, String strategyName) {
        initializeUserIfNeeded(uid);
        try {
            Strategy.valueOf(strategyName.toUpperCase());
            WalletState state = userStates.get(uid);
            state.setCurrentStrategy(strategyName.toLowerCase());
            return state;
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Estrategia de inversión inválida: " + strategyName);
        }
    }

    public synchronized void simulateDayForAllUsers() {
        for (String uid : userStates.keySet()) {
            simulateDayForUser(uid);
        }
    }

    private void simulateDayForUser(String uid) {
        WalletState state = userStates.get(uid);
        List<Transaction> transactions = userTransactions.get(uid);

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

        String titleSuffix = "";
        if (strategy == Strategy.MODERATE) {
            titleSuffix = " (Fondo Mixto)";
        } else if (strategy == Strategy.AGGRESSIVE) {
            titleSuffix = earningsToday >= 0 ? " (Crypto Alza 🚀)" : " (Corrección de Mercado 📉)";
        }

        Transaction tx = new Transaction(
            transactions.size() + 1,
            "interest",
            "Acreditación Diaria Rendimiento" + titleSuffix,
            earningsToday,
            getFormattedDate(state.getSimulatedDaysCount()),
            true
        );
        
        transactions.add(0, tx);
        
        if (transactions.size() > 100) {
            transactions.remove(transactions.size() - 1);
        }
    }

    public List<Map<String, Object>> getProjection(String uid, int days) {
        initializeUserIfNeeded(uid);
        if (days <= 0) {
            throw new IllegalArgumentException("El horizonte de días debe ser mayor a cero.");
        }
        
        WalletState state = userStates.get(uid);
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
