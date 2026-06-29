export interface WalletState {
    balance: number;
    balance30dAgo: number;
    balance30dDay: number;
    balance30dDate: string;
    mtBalance?: number;
    investedAmount: number;
    totalEarnings: number;
    currentStrategy: string;
    todayEarnings: number;
    simulatedDaysCount: number;
    mtConnected?: boolean;
}

export interface MtAccountStatus {
  [key: string]: unknown;
  MSG?: string;
  COMPANY?: string;
  CURRENCY?: string;
  NAME?: string;
  SERVER?: string;
  LOGIN?: number;
  LEVERAGE?: number;
  BALANCE?: number;
  CREDIT?: number;
  PROFIT?: number;
  EQUITY?: number;
  MARGIN?: number;
  MARGIN_FREE?: number;
  MARGIN_LEVEL?: number;
  MARGIN_SO_CAL?: number;
  MARGIN_SO_SO?: number;
  TRADE_MODE?: number;
  TRADE_ALLOWED?: number;
  TRADE_EXPERT?: number;
  DEMO?: string;
}

export interface Transaction {
  id: number;
  type: 'deposit' | 'withdraw' | 'interest';
  title: string;
  amount: number;
  date: string;
  isFresh: boolean;
}

export interface StrategyDetails {
  tna: number;
  riskText: string;
  riskClass: string;
  description: string;
  dailyRate: number;
  volatility: number;
}

export interface ProjectionPoint {
  day: number;
  label: string;
  balance: number;
  earnings: number;
}
