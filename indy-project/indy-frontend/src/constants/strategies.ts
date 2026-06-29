import { StrategyDetails } from '../types';

export const STRATEGIES: Record<string, StrategyDetails> = {
  conservative: {
    tna: 70.0,
    riskText: 'Riesgo Bajo',
    riskClass: 'badge-low',
    description:
      'Fondo remunerado de alta liquidez. Ideal para tener disponibilidad de tu saldo las 24 hs sin fluctuaciones de capital.',
    dailyRate: 0.7 / 365,
    volatility: 0.0,
  },
  moderate: {
    tna: 95.0,
    riskText: 'Riesgo Medio',
    riskClass: 'badge-medium',
    description:
      'Fondo mixto balanceado. Combina renta fija e instrumentos corporativos para maximizar tus rendimientos sin exponer demasiado capital.',
    dailyRate: 0.95 / 365,
    volatility: 0.0005,
  },
  aggressive: {
    tna: 140.0,
    riskText: 'Riesgo Alto',
    riskClass: 'badge-high',
    description:
      'Fondo de alta volatilidad basado en activos globales y criptomonedas. Obtén rendimientos espectaculares asumiendo pequeñas fluctuaciones diarias.',
    dailyRate: 1.4 / 365,
    volatility: 0.0035,
  },
};

export const STRATEGY_KEYS = ['conservative', 'moderate', 'aggressive'] as const;
