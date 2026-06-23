package com.indy.wallet.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.indy.wallet.model.Transaction;
import com.indy.wallet.model.WalletState;
import com.indy.wallet.service.InvestmentService;
import com.indy.wallet.service.MtSocketApiClient;
import com.indy.wallet.service.WalletService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;
    private final InvestmentService investmentService;
    private final MtSocketApiClient mtSocketApiClient;

    public WalletController(WalletService walletService,
                            InvestmentService investmentService,
                            MtSocketApiClient mtSocketApiClient) {
        this.walletService = walletService;
        this.investmentService = investmentService;
        this.mtSocketApiClient = mtSocketApiClient;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(walletService.getStatus(jwt.getSubject()));
    }

    @GetMapping("/mt-status")
    public ResponseEntity<Map<String, Object>> getMtStatus() {
        boolean connected = false;
        String lastError = null;
        try {
            var status = mtSocketApiClient.getAccountStatus();
            connected = status != null && status.getBalance() != null;
            if (!connected) {
                lastError = "No se pudo obtener el balance";
            }
        } catch (Exception e) {
            connected = false;
            lastError = e.getMessage();
        }
        return ResponseEntity.ok(Map.of(
            "connected", connected,
            "lastError", lastError != null ? lastError : ""
        ));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(walletService.getTransactions(jwt.getSubject()));
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Double> body) {
        if (!body.containsKey("amount")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Falta el campo 'amount' en el cuerpo del mensaje."));
        }
        try {
            double amount = body.get("amount");
            WalletState updatedState = walletService.deposit(jwt.getSubject(), amount);
            return ResponseEntity.ok(updatedState);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Double> body) {
        if (!body.containsKey("amount")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Falta el campo 'amount' en el cuerpo del mensaje."));
        }
        try {
            double amount = body.get("amount");
            WalletState updatedState = walletService.withdraw(jwt.getSubject(), amount);
            return ResponseEntity.ok(updatedState);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/strategy")
    public ResponseEntity<?> setStrategy(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, String> body) {
        if (!body.containsKey("strategy")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Falta el campo 'strategy' en el cuerpo del mensaje."));
        }
        try {
            String strategy = body.get("strategy");
            WalletState updatedState = walletService.setStrategy(jwt.getSubject(), strategy);
            return ResponseEntity.ok(updatedState);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/simulate-day")
    public ResponseEntity<?> simulateDayForAll() {
        walletService.simulateDayForAllUsers();
        investmentService.simulateDayForAllInvestments();
        return ResponseEntity.ok(Map.of("message", "Simulación completada para wallets e inversiones."));
    }

    @GetMapping("/projection")
    public ResponseEntity<?> getProjection(@AuthenticationPrincipal Jwt jwt, @RequestParam(value = "days", defaultValue = "90") int days) {
        try {
            List<Map<String, Object>> projection = walletService.getProjection(jwt.getSubject(), days);
            return ResponseEntity.ok(projection);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Endpoint especial para pruebas: convierte al usuario actual en ADMIN
    @PostMapping("/request-admin")
    public ResponseEntity<?> requestAdmin(@AuthenticationPrincipal Jwt jwt) {
        try {
            Map<String, Object> claims = new HashMap<>();
            claims.put("admin", true);
            FirebaseAuth.getInstance().setCustomUserClaims(jwt.getSubject(), claims);
            return ResponseEntity.ok(Map.of("message", "Permisos de ADMIN concedidos. Por favor, cierra sesión y vuelve a iniciar sesión para que el cambio tenga efecto en el token."));
        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al asignar rol de administrador: " + e.getMessage()));
        }
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAllExceptions(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error interno en el servidor: " + e.getMessage()));
    }
}
