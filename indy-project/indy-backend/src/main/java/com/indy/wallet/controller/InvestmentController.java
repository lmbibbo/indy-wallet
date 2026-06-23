package com.indy.wallet.controller;

import com.indy.wallet.model.AccountBalanceHistory;
import com.indy.wallet.model.Investment;
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

    @PostMapping("/invest")
    public ResponseEntity<?> invest(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> body) {
        if (!body.containsKey("amount") || !body.containsKey("strategy")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Faltan campos 'amount' y/o 'strategy'."));
        }
        try {
            double amount = ((Number) body.get("amount")).doubleValue();
            String strategy = (String) body.get("strategy");
            Investment investment = investmentService.invest(jwt.getSubject(), amount, strategy);
            return ResponseEntity.ok(investment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Investment>> getInvestments(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(investmentService.getInvestments(jwt.getSubject()));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getInvestmentSummary(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(investmentService.getInvestmentSummary(jwt.getSubject()));
    }
}
