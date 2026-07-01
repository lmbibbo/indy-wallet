package com.indy.wallet.service;

import com.indy.wallet.model.AccountStatusReply;
import com.indy.wallet.model.Event;
import com.indy.wallet.model.FondoComun;
import com.indy.wallet.model.Participation;
import com.indy.wallet.model.Strategy;
import com.indy.wallet.model.WalletState;
import com.indy.wallet.repository.EventRepository;
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
    private final EventRepository eventRepository;
    private final FondoComunService fondoComunService;
    private final MtSocketApiClient mtSocketApiClient;
    private final DateTimeFormatter dateFormatter;

    public WalletService(WalletStateRepository walletStateRepository,
                         EventRepository eventRepository,
                         FondoComunService fondoComunService,
                         MtSocketApiClient mtSocketApiClient) {
        this.walletStateRepository = walletStateRepository;
        this.eventRepository = eventRepository;
        this.fondoComunService = fondoComunService;
        this.mtSocketApiClient = mtSocketApiClient;
        this.dateFormatter = DateTimeFormatter.ofPattern("dd 'de' MMM, yyyy", Locale.forLanguageTag("es-AR"));
    }

    private WalletState initializeUserIfNeeded(String uid) {
        return walletStateRepository.findById(uid).orElseGet(() -> {
            WalletState state = new WalletState(uid, 0.00, 0.00, 0.000000, 0);
            return walletStateRepository.save(state);
        });
    }

    public Map<String, Object> getStatus(String uid) {
        WalletState state = initializeUserIfNeeded(uid);
        FondoComun fund = fondoComunService.getFund();
        Participation part = fondoComunService.getParticipation(uid);

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

        double fundTotal = fund != null ? fund.getTotalValue() : 0.0;
        double userPercentage = part != null ? part.getPercentage() : 0.0;
        double userInvestedValue = fundTotal * (userPercentage / 100.0);
        double userInvestedAmount = part != null ? part.getInvestedAmount() : 0.0;

        Map<String, Object> result = new HashMap<>();
        result.put("uid", state.getUid());
        result.put("balance", state.getBalance());
        result.put("mtBalance", mtBalance);
        result.put("fundTotalValue", fundTotal);
        result.put("fundStrategy", fund != null ? fund.getStrategy() : "conservative");
        result.put("userPercentage", userPercentage);
        result.put("userInvestedValue", userInvestedValue);
        result.put("userInvestedAmount", userInvestedAmount);
        result.put("totalEarnings", state.getTotalEarnings());
        result.put("todayEarnings", state.getTodayEarnings());
        result.put("simulatedDaysCount", state.getSimulatedDaysCount());
        result.put("mtConnected", mtConnected);
        return result;
    }

    public List<Event> getEvents(String uid) {
        initializeUserIfNeeded(uid);
        return eventRepository.findByUidOrderByIdDesc(uid);
    }

    @Transactional
    public WalletState deposit(String uid, double amount) {
        WalletState state = initializeUserIfNeeded(uid);
        if (amount <= 0) {
            throw new IllegalArgumentException("El monto a ingresar debe ser mayor que cero.");
        }

        state.setBalance(state.getBalance() + amount);
        walletStateRepository.save(state);

        FondoComun fund = fondoComunService.getOrCreateFund();
        Participation part = fondoComunService.getParticipation(uid);

        Event event = new Event(uid, "deposit", amount, fund.getTotalValue(),
                state.getBalance(), part != null ? part.getPercentage() : 0.0, state.getSimulatedDaysCount());
        eventRepository.save(event);

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

        FondoComun fund = fondoComunService.getOrCreateFund();
        Participation part = fondoComunService.getParticipation(uid);

        Event event = new Event(uid, "withdraw", amount, fund.getTotalValue(),
                state.getBalance(), part != null ? part.getPercentage() : 0.0, state.getSimulatedDaysCount());
        eventRepository.save(event);

        return state;
    }

    @Transactional
    public WalletState invest(String uid, double amount) {
        WalletState state = initializeUserIfNeeded(uid);
        if (amount <= 0) {
            throw new IllegalArgumentException("El monto a invertir debe ser mayor que cero.");
        }
        if (amount > state.getBalance()) {
            throw new IllegalArgumentException("Saldo insuficiente. Disponible: $" + String.format("%.2f", state.getBalance()));
        }

        state.setBalance(state.getBalance() - amount);
        walletStateRepository.save(state);

        fondoComunService.invest(uid, amount, state.getSimulatedDaysCount());

        return state;
    }

    @Transactional
    public WalletState withdrawInvested(String uid, double amount) {
        WalletState state = initializeUserIfNeeded(uid);
        double withdrawn = fondoComunService.withdrawFromPool(uid, amount, state.getSimulatedDaysCount());
        state.setBalance(state.getBalance() + withdrawn);
        return walletStateRepository.save(state);
    }

    @Transactional
    public WalletState withdrawAllInvested(String uid) {
        WalletState state = initializeUserIfNeeded(uid);
        double withdrawn = fondoComunService.withdrawAllFromPool(uid, state.getSimulatedDaysCount());
        state.setBalance(state.getBalance() + withdrawn);
        return walletStateRepository.save(state);
    }

    @Transactional
    public void simulateDayForAllUsers() {
        fondoComunService.simulateDay();

        List<WalletState> allUsers = walletStateRepository.findAll();
        for (WalletState state : allUsers) {
            state.setSimulatedDaysCount(state.getSimulatedDaysCount() + 1);
            walletStateRepository.save(state);
        }
    }

    public List<Map<String, Object>> getProjection(String uid, int days) {
        WalletState state = initializeUserIfNeeded(uid);
        if (days <= 0) {
            throw new IllegalArgumentException("El horizonte de días debe ser mayor a cero.");
        }

        FondoComun fund = fondoComunService.getFund();
        Participation part = fondoComunService.getParticipation(uid);
        if (fund == null) {
            return List.of();
        }

        Strategy strategy = Strategy.valueOf(fund.getStrategy().toUpperCase());
        double fundValue = fund.getTotalValue();
        double userPercentage = part != null ? part.getPercentage() : 0.0;
        double baseUserValue = fundValue * (userPercentage / 100.0);

        List<Map<String, Object>> projectionPoints = new ArrayList<>();
        double tempFundValue = fundValue;

        Map<String, Object> initialPoint = new HashMap<>();
        initialPoint.put("day", 0);
        initialPoint.put("label", "Hoy");
        initialPoint.put("balance", state.getBalance() + baseUserValue);
        initialPoint.put("earnings", 0.0);
        projectionPoints.add(initialPoint);

        for (int i = 1; i <= days; i++) {
            tempFundValue = tempFundValue * (1.0 + strategy.getDailyRate());

            boolean shouldAddPoint = false;
            if (days <= 30) {
                shouldAddPoint = true;
            } else if (days <= 100) {
                shouldAddPoint = (i % 5 == 0 || i == days);
            } else {
                shouldAddPoint = (i % 15 == 0 || i == days);
            }

            if (shouldAddPoint) {
                double projectedUserValue = tempFundValue * (userPercentage / 100.0);
                Map<String, Object> point = new HashMap<>();
                point.put("day", i);
                point.put("label", "D\u00eda " + i);
                point.put("balance", state.getBalance() + projectedUserValue);
                point.put("earnings", (state.getBalance() + projectedUserValue) - (state.getBalance() + baseUserValue));
                projectionPoints.add(point);
            }
        }

        return projectionPoints;
    }
}
