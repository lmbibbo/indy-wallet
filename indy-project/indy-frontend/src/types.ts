export interface WalletState {
    balance: number;
    totalEarnings: number;
    currentStrategy: string;
    todayEarnings: number;
    simulatedDaysCount: number;
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
