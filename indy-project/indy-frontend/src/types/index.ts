export interface WalletState {
    balance: number;
    mtBalance?: number;
    fundTotalValue: number;
    fundStrategy: string;
    userPercentage: number;
    userInvestedValue: number;
    userInvestedAmount: number;
    totalEarnings: number;
    todayEarnings: number;
    simulatedDaysCount: number;
    mtConnected?: boolean;
}

export interface FundStatus {
    exists: boolean;
    totalValue?: number;
    strategy?: string;
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

export interface WalletEvent {
  id: number;
  uid?: string;
  type: 'deposit' | 'withdraw' | 'interest' | 'pool_interest' | 'invest' | 'disinvest';
  amount: number;
  fundTotalAfter: number;
  userBalanceAfter: number;
  userPercentageAfter: number;
  day: number;
  timestamp: string;
}

export interface StrategyDetails {
  name: string;
  tna: number;
  riskText: string;
  riskClass: string;
  description: string;
  dailyRate: number;
  volatility: number;
}

export interface Trade {
  TICKET: number;
  SYMBOL: string;
  TYPE: string;
  LOTS: number;
  OPEN_TIME: string;
  CLOSE_TIME: string;
  PROFIT: number;
  SWAP: number;
  COMMISSION: number;
  COMMENT: string;
}

export interface HistoryOrdersReply {
  MSG: string;
  TRADES: Trade[];
  ERROR_ID: number;
  ERROR_DESCRIPTION: string;
}

export interface ProjectionPoint {
  day: number;
  label: string;
  balance: number;
  earnings: number;
}
