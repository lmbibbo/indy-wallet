package com.indy.wallet.controller;

import com.indy.wallet.model.AccountBalanceHistory;
import com.indy.wallet.repository.AccountBalanceHistoryRepository;
import com.indy.wallet.service.InvestmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/investments")
public class InvestmentController {

    private final InvestmentService investmentService;
    private final AccountBalanceHistoryRepository historyRepository;

    public InvestmentController(InvestmentService investmentService,
                                AccountBalanceHistoryRepository historyRepository) {
        this.investmentService = investmentService;
        this.historyRepository = historyRepository;
    }

    @GetMapping("/history")
    public ResponseEntity<List<AccountBalanceHistory>> getInvestmentHistory() {
        return ResponseEntity.ok(historyRepository.findAllByOrderByTimestampAsc());
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getInvestmentSummary(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(investmentService.getSummary(jwt.getSubject()));
    }
}
