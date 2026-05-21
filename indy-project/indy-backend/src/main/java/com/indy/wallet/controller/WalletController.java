package com.indy.wallet.controller;

import com.indy.wallet.model.Transaction;
import com.indy.wallet.model.WalletState;
import com.indy.wallet.service.WalletService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/status")
    public ResponseEntity<WalletState> getStatus() {
        return ResponseEntity.ok(walletService.getStatus());
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions() {
        return ResponseEntity.ok(walletService.getTransactions());
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(@RequestBody Map<String, Double> body) {
        if (!body.containsKey("amount")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Falta el campo 'amount' en el cuerpo del mensaje."));
        }
        try {
            double amount = body.get("amount");
            WalletState updatedState = walletService.deposit(amount);
            return ResponseEntity.ok(updatedState);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody Map<String, Double> body) {
        if (!body.containsKey("amount")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Falta el campo 'amount' en el cuerpo del mensaje."));
        }
        try {
            double amount = body.get("amount");
            WalletState updatedState = walletService.withdraw(amount);
            return ResponseEntity.ok(updatedState);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/strategy")
    public ResponseEntity<?> setStrategy(@RequestBody Map<String, String> body) {
        if (!body.containsKey("strategy")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Falta el campo 'strategy' en el cuerpo del mensaje."));
        }
        try {
            String strategy = body.get("strategy");
            WalletState updatedState = walletService.setStrategy(strategy);
            return ResponseEntity.ok(updatedState);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/simulate-day")
    public ResponseEntity<WalletState> simulateDay() {
        WalletState updatedState = walletService.simulateDay();
        return ResponseEntity.ok(updatedState);
    }

    @GetMapping("/projection")
    public ResponseEntity<?> getProjection(@RequestParam(value = "days", defaultValue = "90") int days) {
        try {
            List<Map<String, Object>> projection = walletService.getProjection(days);
            return ResponseEntity.ok(projection);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAllExceptions(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error interno en el servidor: " + e.getMessage()));
    }
}
