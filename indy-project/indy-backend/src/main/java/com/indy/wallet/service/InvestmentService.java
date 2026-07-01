package com.indy.wallet.service;

import com.indy.wallet.model.Event;
import com.indy.wallet.model.FondoComun;
import com.indy.wallet.model.Participation;
import com.indy.wallet.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InvestmentService {

    private final FondoComunService fondoComunService;
    private final EventRepository eventRepository;

    public InvestmentService(FondoComunService fondoComunService,
                             EventRepository eventRepository) {
        this.fondoComunService = fondoComunService;
        this.eventRepository = eventRepository;
    }

    public Map<String, Object> getSummary(String uid) {
        FondoComun fund = fondoComunService.getFund();
        Participation part = fondoComunService.getParticipation(uid);

        double fundTotal = fund != null ? fund.getTotalValue() : 0.0;
        double userPercentage = part != null ? part.getPercentage() : 0.0;
        double currentValue = fundTotal * (userPercentage / 100.0);
        double investedAmount = part != null ? part.getInvestedAmount() : 0.0;

        List<Event> interestEvents = eventRepository.findByUidOrderByIdDesc(uid).stream()
                .filter(e -> "interest".equals(e.getType()))
                .toList();
        double totalReturns = interestEvents.stream().mapToDouble(Event::getAmount).sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("currentValue", currentValue);
        summary.put("totalInvested", investedAmount);
        summary.put("totalReturns", totalReturns);
        summary.put("percentage", userPercentage);
        summary.put("fundTotalValue", fundTotal);
        return summary;
    }
}
