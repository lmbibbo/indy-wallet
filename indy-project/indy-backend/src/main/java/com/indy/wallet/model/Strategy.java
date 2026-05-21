package com.indy.wallet.model;

public enum Strategy {
    CONSERVATIVE(70.0, "Riesgo Bajo", "badge-low", 
                 "Fondo remunerado de alta liquidez. Ideal para tener disponibilidad de tu saldo las 24 hs sin fluctuaciones de capital.", 
                 0.0000),
    MODERATE(95.0, "Riesgo Medio", "badge-medium", 
               "Fondo mixto balanceado. Combina renta fija e instrumentos corporativos para maximizar tus rendimientos sin exponer demasiado capital.", 
               0.0005),
    AGGRESSIVE(140.0, "Riesgo Alto", "badge-high", 
                 "Fondo de alta volatilidad basado en activos globales y criptomonedas. Obtén rendimientos espectaculares asumiendo pequeñas fluctuaciones diarias.", 
                 0.0035);

    private final double tna;
    private final String riskText;
    private final String riskClass;
    private final String description;
    private final double dailyRate;
    private final double volatility;

    Strategy(double tna, String riskText, String riskClass, String description, double volatility) {
        this.tna = tna;
        this.riskText = riskText;
        this.riskClass = riskClass;
        this.description = description;
        this.dailyRate = tna / 100.0 / 365.0;
        this.volatility = volatility;
    }

    public double getTna() {
        return tna;
    }

    public String getRiskText() {
        return riskText;
    }

    public String getRiskClass() {
        return riskClass;
    }

    public String getDescription() {
        return description;
    }

    public double getDailyRate() {
        return dailyRate;
    }

    public double getVolatility() {
        return volatility;
    }
}
