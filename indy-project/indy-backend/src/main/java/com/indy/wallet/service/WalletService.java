package com.indy.wallet.service;

import com.indy.wallet.model.Strategy;
import com.indy.wallet.model.Transaction;
import com.indy.wallet.model.WalletState;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class WalletService {
    
    private final WalletState state;
    private final List<Transaction> transactions;
    private final DateTimeFormatter dateFormatter;

    public WalletService() {
        this.dateFormatter = DateTimeFormatter.ofPattern("dd 'de' MMM, yyyy", Locale.forLanguageTag("es-AR"));
        
        // Estado inicial
        this.state = new WalletState(150000.00, 0.00, "conservative", 0.000000, 0);
        this.transactions = new CopyOnWriteArrayList<>();
        
        // Transacción inicial
        this.transactions.add(new Transaction(
            1L,
            "deposit",
            "Depósito Inicial",
            150000.00,
            getFormattedDate(0),
            false
        ));
    }

    private String getFormattedDate(int daysOffset) {
        LocalDate date = LocalDate.now().plusDays(daysOffset);
        return date.format(dateFormatter);
    }

    public WalletState getStatus() {
        return state;
    }

    public List<Transaction> getTransactions() {
        return transactions;
    }

    public synchronized WalletState deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("El monto a ingresar debe ser mayor que cero.");
        }
        
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

    public synchronized WalletState withdraw(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("El monto a retirar debe ser mayor que cero.");
        }
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

    public synchronized WalletState setStrategy(String strategyName) {
        try {
            Strategy.valueOf(strategyName.toUpperCase());
            state.setCurrentStrategy(strategyName.toLowerCase());
            return state;
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Estrategia de inversión inválida: " + strategyName);
        }
    }

    public synchronized WalletState simulateDay() {
        Strategy strategy = Strategy.valueOf(state.getCurrentStrategy().toUpperCase());
        
        double dailyYieldRate = strategy.getDailyRate();
        
        // Si hay volatilidad (moderado o agresivo), añadir pequeña fluctuación estocástica
        if (strategy.getVolatility() > 0.0) {
            // Genera fluctuación gaussiana entre -volatilidad y +volatilidad
            double fluctuation = (Math.random() - 0.5) * 2.0 * strategy.getVolatility();
            dailyYieldRate += fluctuation;
        }

        double earningsToday = state.getBalance() * dailyYieldRate;
        
        state.setBalance(state.getBalance() + earningsToday);
        state.setTotalEarnings(state.getTotalEarnings() + earningsToday);
        state.setSimulatedDaysCount(state.getSimulatedDaysCount() + 1);
        state.setTodayEarnings(0.0); // Resetear ganancias live diarias

        // Título descriptivo según rendimiento
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
        
        // Evitar desbordamiento de transacciones en memoria
        if (transactions.size() > 100) {
            transactions.remove(transactions.size() - 1);
        }

        return state;
    }

    public List<Map<String, Object>> getProjection(int days) {
        if (days <= 0) {
            throw new IllegalArgumentException("El horizonte de días debe ser mayor a cero.");
        }
        
        Strategy strategy = Strategy.valueOf(state.getCurrentStrategy().toUpperCase());
        double base = state.getBalance();
        
        List<Map<String, Object>> projectionPoints = new ArrayList<>();
        double tempBalance = base;

        // Agregar punto inicial (Día 0)
        Map<String, Object> initialPoint = new HashMap<>();
        initialPoint.put("day", 0);
        initialPoint.put("label", "Hoy");
        initialPoint.put("balance", base);
        initialPoint.put("earnings", 0.0);
        projectionPoints.add(initialPoint);

        for (int i = 1; i <= days; i++) {
            tempBalance = tempBalance * (1.0 + strategy.getDailyRate());
            
            // Decidir si añadimos el punto para alivianar el peso del payload JSON
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
