package com.indy.wallet.service;

import com.indy.wallet.model.Investment;
import com.indy.wallet.model.Strategy;
import com.indy.wallet.model.WalletState;
import com.indy.wallet.repository.InvestmentRepository;
import com.indy.wallet.repository.WalletStateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InvestmentService {

    private final InvestmentRepository investmentRepository;
    private final WalletStateRepository walletStateRepository;

    public InvestmentService(InvestmentRepository investmentRepository,
                             WalletStateRepository walletStateRepository) {
        this.investmentRepository = investmentRepository;
        this.walletStateRepository = walletStateRepository;
    }

    @Transactional
    public Investment invest(String uid, double amount, String strategyName) {
        WalletState state = walletStateRepository.findById(uid).orElse(null);
        if (state == null) {
            throw new IllegalArgumentException("Usuario no encontrado. Debe tener una billetera primero.");
        }
        if (amount <= 0) {
            throw new IllegalArgumentException("El monto a invertir debe ser mayor que cero.");
        }
        if (amount > state.getBalance()) {
            throw new IllegalArgumentException("Saldo insuficiente. Disponible: $" + String.format("%.2f", state.getBalance()));
        }
        try {
            Strategy.valueOf(strategyName.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Estrategia inválida: " + strategyName);
        }

        state.setBalance(state.getBalance() - amount);
        walletStateRepository.save(state);

        Investment investment = new Investment(uid, amount, strategyName.toLowerCase());
        return investmentRepository.save(investment);
    }

    public List<Investment> getInvestments(String uid) {
        return investmentRepository.findByUidOrderByIdDesc(uid);
    }

    public Map<String, Object> getInvestmentSummary(String uid) {
        List<Investment> activeInvestments = investmentRepository.findByUidAndStatus(uid, "active");
        double totalInvested = 0.0;
        double currentValue = 0.0;
        double totalReturns = 0.0;

        for (Investment inv : activeInvestments) {
            totalInvested += inv.getAmount();
            currentValue += inv.getCurrentValue();
            totalReturns += inv.getTotalReturns();
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalInvested", totalInvested);
        summary.put("currentValue", currentValue);
        summary.put("totalReturns", totalReturns);
        summary.put("activeCount", activeInvestments.size());
        return summary;
    }

    @Transactional
    public void simulateDayForAllInvestments() {
        List<Investment> activeInvestments = investmentRepository.findByStatus("active");
        for (Investment inv : activeInvestments) {
            simulateDayForInvestment(inv);
        }
    }

    private void simulateDayForInvestment(Investment inv) {
        Strategy strategy = Strategy.valueOf(inv.getStrategy().toUpperCase());
        double dailyRate = strategy.getDailyRate();
        if (strategy.getVolatility() > 0.0) {
            double fluctuation = (Math.random() - 0.5) * 2.0 * strategy.getVolatility();
            dailyRate += fluctuation;
        }
        double dailyReturn = inv.getCurrentValue() * dailyRate;
        inv.setCurrentValue(inv.getCurrentValue() + dailyReturn);
        inv.setTotalReturns(inv.getTotalReturns() + dailyReturn);
        investmentRepository.save(inv);
    }
}
