package com.indy.wallet.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.indy.wallet.model.Event;
import com.indy.wallet.model.WalletState;
import com.indy.wallet.service.FondoComunService;
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
    private final FondoComunService fondoComunService;
    private final InvestmentService investmentService;
    private final MtSocketApiClient mtSocketApiClient;

    public WalletController(WalletService walletService,
                            FondoComunService fondoComunService,
                            InvestmentService investmentService,
                            MtSocketApiClient mtSocketApiClient) {
        this.walletService = walletService;
        this.fondoComunService = fondoComunService;
        this.investmentService = investmentService;
        this.mtSocketApiClient = mtSocketApiClient;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(walletService.getStatus(jwt.getSubject()));
    }

    @GetMapping("/fund-status")
    public ResponseEntity<Map<String, Object>> getFundStatus() {
        var fund = fondoComunService.getFund();
        if (fund == null) {
            return ResponseEntity.ok(Map.of("exists", false));
        }
        return ResponseEntity.ok(Map.of(
            "exists", true,
            "totalValue", fund.getTotalValue(),
            "strategy", fund.getStrategy()
        ));
    }

    @GetMapping("/mt-account")
    public ResponseEntity<?> getMtAccount() {
        try {
            var status = mtSocketApiClient.getAccountStatus();
            if (status != null && status.getBalance() != null) {
                return ResponseEntity.ok(status);
            }
            return ResponseEntity.ok(Map.of("connected", false, "error", "No se pudo obtener la cuenta MT"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("connected", false, "error", e.getMessage()));
        }
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

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getEvents(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(walletService.getEvents(jwt.getSubject()));
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Double> body) {
        if (!body.containsKey("amount")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Falta el campo 'amount' en el cuerpo del mensaje."));
        }
        try {
            double amount = body.get("amount");
            walletService.deposit(jwt.getSubject(), amount);
            return ResponseEntity.ok(walletService.getStatus(jwt.getSubject()));
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
            walletService.withdraw(jwt.getSubject(), amount);
            return ResponseEntity.ok(walletService.getStatus(jwt.getSubject()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/invest")
    public ResponseEntity<?> invest(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Double> body) {
        if (!body.containsKey("amount")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Falta el campo 'amount' en el cuerpo del mensaje."));
        }
        try {
            double amount = body.get("amount");
            walletService.invest(jwt.getSubject(), amount);
            return ResponseEntity.ok(walletService.getStatus(jwt.getSubject()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/withdraw-invested")
    public ResponseEntity<?> withdrawInvested(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Double> body) {
        if (!body.containsKey("amount")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Falta el campo 'amount' en el cuerpo del mensaje."));
        }
        try {
            double amount = body.get("amount");
            walletService.withdrawInvested(jwt.getSubject(), amount);
            return ResponseEntity.ok(walletService.getStatus(jwt.getSubject()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/withdraw-all-invested")
    public ResponseEntity<?> withdrawAllInvested(@AuthenticationPrincipal Jwt jwt) {
        try {
            walletService.withdrawAllInvested(jwt.getSubject());
            return ResponseEntity.ok(walletService.getStatus(jwt.getSubject()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/strategy")
    public ResponseEntity<?> setFundStrategy(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, String> body) {
        if (!body.containsKey("strategy")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Falta el campo 'strategy' en el cuerpo del mensaje."));
        }
        try {
            String strategy = body.get("strategy");
            fondoComunService.setFundStrategy(strategy);
            return ResponseEntity.ok(Map.of("message", "Estrategia del fondo actualizada a " + strategy));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/mt-orders")
    public ResponseEntity<?> getMtOrders(@RequestParam("from_date") String fromDate,
                                          @RequestParam("to_date") String toDate) {
        try {
            var reply = mtSocketApiClient.getHistoryOrders(fromDate, toDate);
            if (reply == null) {
                return ResponseEntity.ok(Map.of("error", "No se pudieron obtener las órdenes"));
            }
            return ResponseEntity.ok(reply);
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/daily-profit")
    public ResponseEntity<Map<String, Object>> getDailyProfit() {
        return ResponseEntity.ok(fondoComunService.getDailyProfitBreakdown());
    }

    @GetMapping("/strategies")
    public ResponseEntity<List<Map<String, Object>>> getStrategies() {
        List<Map<String, Object>> strategies = new java.util.ArrayList<>();
        for (com.indy.wallet.model.Strategy s : com.indy.wallet.model.Strategy.values()) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", s.name().toLowerCase());
            map.put("tna", s.getTna());
            map.put("riskText", s.getRiskText());
            map.put("riskClass", s.getRiskClass());
            map.put("description", s.getDescription());
            map.put("dailyRate", s.getDailyRate());
            map.put("volatility", s.getVolatility());
            strategies.add(map);
        }
        return ResponseEntity.ok(strategies);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/simulate-day")
    public ResponseEntity<?> simulateDayForAll() {
        walletService.simulateDayForAllUsers();
        return ResponseEntity.ok(Map.of("message", "Simulaci\u00f3n completada para el d\u00eda."));
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

    @PostMapping("/request-admin")
    public ResponseEntity<?> requestAdmin(@AuthenticationPrincipal Jwt jwt) {
        try {
            Map<String, Object> claims = new HashMap<>();
            claims.put("admin", true);
            FirebaseAuth.getInstance().setCustomUserClaims(jwt.getSubject(), claims);
            return ResponseEntity.ok(Map.of("message", "Permisos de ADMIN concedidos. Por favor, cierra sesi\u00f3n y vuelve a iniciar sesi\u00f3n para que el cambio tenga efecto en el token."));
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
