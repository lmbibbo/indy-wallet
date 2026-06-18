package com.indy.wallet.controller;

import com.indy.wallet.model.AccountBalanceHistory;
import com.indy.wallet.repository.AccountBalanceHistoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/investments")
public class InvestmentController {

    private final AccountBalanceHistoryRepository repository;

    public InvestmentController(AccountBalanceHistoryRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/history")
    public ResponseEntity<List<AccountBalanceHistory>> getInvestmentHistory() {
        List<AccountBalanceHistory> history = repository.findAllByOrderByTimestampAsc();
        return ResponseEntity.ok(history);
    }
}
