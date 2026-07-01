package com.indy.wallet.service;

import com.indy.wallet.model.Event;
import com.indy.wallet.model.FondoComun;
import com.indy.wallet.model.Participation;
import com.indy.wallet.model.Strategy;
import com.indy.wallet.repository.EventRepository;
import com.indy.wallet.repository.FondoComunRepository;
import com.indy.wallet.repository.ParticipationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FondoComunService {

    private static final Logger logger = LoggerFactory.getLogger(FondoComunService.class);

    private final FondoComunRepository fondoComunRepository;
    private final ParticipationRepository participationRepository;
    private final EventRepository eventRepository;
    private final MtSocketApiClient mtSocketApiClient;

    public FondoComunService(FondoComunRepository fondoComunRepository,
                             ParticipationRepository participationRepository,
                             EventRepository eventRepository,
                             MtSocketApiClient mtSocketApiClient) {
        this.fondoComunRepository = fondoComunRepository;
        this.participationRepository = participationRepository;
        this.eventRepository = eventRepository;
        this.mtSocketApiClient = mtSocketApiClient;
    }

    public FondoComun getOrCreateFund() {
        List<FondoComun> all = fondoComunRepository.findAll();
        if (!all.isEmpty()) {
            return all.get(0);
        }
        FondoComun fund = new FondoComun(0.0, "conservative");
        return fondoComunRepository.save(fund);
    }

    public FondoComun getFund() {
        List<FondoComun> all = fondoComunRepository.findAll();
        if (all.isEmpty()) return null;
        return all.get(0);
    }

    public Participation getParticipation(String uid) {
        return participationRepository.findByUid(uid).orElse(null);
    }

    @Transactional
    public void setFundStrategy(String strategyName) {
        FondoComun fund = getOrCreateFund();
        try {
            Strategy.valueOf(strategyName.toUpperCase());
            fund.setStrategy(strategyName.toLowerCase());
            fondoComunRepository.save(fund);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Estrategia de inversión inválida: " + strategyName);
        }
    }

    @Transactional
    public void invest(String uid, double amount, int currentDay) {
        FondoComun fund = getOrCreateFund();
        double fundBefore = fund.getTotalValue();

        fund.setTotalValue(fundBefore + amount);
        fondoComunRepository.save(fund);

        Participation part = participationRepository.findByUid(uid).orElse(null);
        if (part == null) {
            double percentage = fund.getTotalValue() > 0 ? (amount / fund.getTotalValue()) * 100.0 : 0.0;
            part = new Participation(uid, fund.getId(), percentage, amount);
        } else {
            part.setInvestedAmount(part.getInvestedAmount() + amount);
        }
        recalculateAllPercentages(fund.getId());
        part = participationRepository.findByUid(uid).orElse(part);

        double userBalanceAfter = getBalanceForUser(uid);

        Event event = new Event(uid, "invest", amount, fund.getTotalValue(),
                userBalanceAfter, part.getPercentage(), currentDay);
        eventRepository.save(event);
    }

    @Transactional
    public double withdrawFromPool(String uid, double amount, int currentDay) {
        FondoComun fund = getOrCreateFund();
        Participation part = participationRepository.findByUid(uid)
                .orElseThrow(() -> new IllegalArgumentException("El usuario no tiene participación en el fondo."));

        if (part.getPercentage() <= 0) {
            throw new IllegalArgumentException("No tiene participación en el fondo.");
        }

        double maxWithdraw = fund.getTotalValue() * (part.getPercentage() / 100.0);
        if (amount > maxWithdraw) {
            throw new IllegalArgumentException("Monto máximo a retirar: $" + String.format("%.2f", maxWithdraw));
        }

        double withdrawalRatio = amount / maxWithdraw;
        double newInvestedAmount = part.getInvestedAmount() * (1.0 - withdrawalRatio);

        fund.setTotalValue(fund.getTotalValue() - amount);
        fondoComunRepository.save(fund);

        part.setInvestedAmount(newInvestedAmount);
        recalculateAllPercentages(fund.getId());
        part = participationRepository.findByUid(uid).orElse(part);

        double userBalanceAfter = getBalanceForUser(uid);

        Event event = new Event(uid, "disinvest", amount, fund.getTotalValue(),
                userBalanceAfter, part.getPercentage(), currentDay);
        eventRepository.save(event);

        return amount;
    }

    @Transactional
    public double withdrawAllFromPool(String uid, int currentDay) {
        FondoComun fund = getOrCreateFund();
        Participation part = participationRepository.findByUid(uid)
                .orElseThrow(() -> new IllegalArgumentException("El usuario no tiene participación en el fondo."));

        if (part.getPercentage() <= 0) {
            throw new IllegalArgumentException("No tiene participación en el fondo.");
        }

        double amount = fund.getTotalValue() * (part.getPercentage() / 100.0);

        fund.setTotalValue(fund.getTotalValue() - amount);
        fondoComunRepository.save(fund);

        part.setInvestedAmount(0.0);
        recalculateAllPercentages(fund.getId());
        part = participationRepository.findByUid(uid).orElse(part);

        double userBalanceAfter = getBalanceForUser(uid);

        Event event = new Event(uid, "disinvest", amount, fund.getTotalValue(),
                userBalanceAfter, part.getPercentage(), currentDay);
        eventRepository.save(event);

        return amount;
    }

    @Transactional
    public void simulateDay() {
        FondoComun fund = getOrCreateFund();
        double earnings;
        boolean usedRealMt4 = false;

        try {
            double realProfit = mtSocketApiClient.getDailyProfit(LocalDate.now());
            if (realProfit != 0.0) {
                earnings = realProfit;
                usedRealMt4 = true;
                logger.info("Profit real MT4: ${}", realProfit);
            } else {
                earnings = 0.0;
            }
        } catch (Exception e) {
            logger.warn("Error con MT4, usando simulación: {}", e.getMessage());
            earnings = 0.0;
        }

        if (!usedRealMt4 && fund.getTotalValue() > 0) {
            Strategy strategy = Strategy.valueOf(fund.getStrategy().toUpperCase());
            double dailyRate = strategy.getDailyRate();
            if (strategy.getVolatility() > 0.0) {
                double fluctuation = (Math.random() - 0.5) * 2.0 * strategy.getVolatility();
                dailyRate += fluctuation;
            }
            earnings = fund.getTotalValue() * dailyRate;
        }

        fund.setTotalValue(fund.getTotalValue() + earnings);
        fondoComunRepository.save(fund);

        List<Participation> allParticipants = participationRepository.findByFundId(fund.getId());
        int day = getNextDay();

        eventRepository.save(new Event(null, "pool_interest", earnings,
                fund.getTotalValue(), 0, 0, day));

        for (Participation part : allParticipants) {
            double userEarnings = earnings * (part.getPercentage() / 100.0);
            Event userEvent = new Event(part.getUid(), "interest", userEarnings,
                    fund.getTotalValue(), getBalanceForUser(part.getUid()),
                    part.getPercentage(), day);
            eventRepository.save(userEvent);
        }
    }

    public Map<String, Object> getDailyProfitBreakdown() {
        Map<String, Object> result = new HashMap<>();
        try {
            double realProfit = mtSocketApiClient.getDailyProfit(LocalDate.now());
            result.put("dailyProfit", realProfit);
            result.put("source", "mt4");
        } catch (Exception e) {
            result.put("dailyProfit", 0.0);
            result.put("source", "simulated");
            result.put("error", e.getMessage());
        }
        return result;
    }

    private void recalculateAllPercentages(Long fundId) {
        FondoComun fund = fondoComunRepository.findById(fundId).orElse(null);
        if (fund == null || fund.getTotalValue() <= 0) return;

        List<Participation> allParts = participationRepository.findByFundId(fundId);
        double totalInvested = allParts.stream().mapToDouble(Participation::getInvestedAmount).sum();

        for (Participation p : allParts) {
            if (totalInvested > 0) {
                p.setPercentage((p.getInvestedAmount() / totalInvested) * 100.0);
            } else {
                p.setPercentage(0.0);
            }
            participationRepository.save(p);
        }
    }

    private double getBalanceForUser(String uid) {
        Participation part = participationRepository.findByUid(uid).orElse(null);
        if (part == null) return 0;
        FondoComun fund = fondoComunRepository.findById(part.getFundId()).orElse(null);
        if (fund == null) return 0;
        return fund.getTotalValue() * (part.getPercentage() / 100.0);
    }

    private int getNextDay() {
        return (int) (System.currentTimeMillis() / 86400000);
    }
}
