import { auth } from '../config/firebase';
import { WalletState, WalletEvent, ProjectionPoint, MtAccountStatus, FundStatus, StrategyDetails } from '../types';

const BACKEND_URL = 'http://localhost:8080/api/wallet';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function apiGet<T>(endpoint: string): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BACKEND_URL}${endpoint}`, { headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function apiPost<T>(endpoint: string, body?: object): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function getStatus(): Promise<WalletState> {
  return apiGet<WalletState>('/status');
}

export function getEvents(): Promise<WalletEvent[]> {
  return apiGet<WalletEvent[]>('/events');
}

export function getProjection(days: number): Promise<ProjectionPoint[]> {
  return apiGet<ProjectionPoint[]>(`/projection?days=${days}`);
}

export function getMtAccount(): Promise<MtAccountStatus> {
  return apiGet<MtAccountStatus>('/mt-account');
}

export function getMtOrders(fromDate: string, toDate: string): Promise<any> {
  return apiGet<any>(`/mt-orders?from_date=${fromDate}&to_date=${toDate}`);
}

export function getMtStatus(): Promise<{ connected: boolean; lastError: string }> {
  return apiGet<{ connected: boolean; lastError: string }>('/mt-status');
}

export function getFundStatus(): Promise<FundStatus> {
  return apiGet<FundStatus>('/fund-status');
}

export function getStrategies(): Promise<StrategyDetails[]> {
  return apiGet<StrategyDetails[]>('/strategies');
}

export function simulateDay(): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/simulate-day');
}

export function deposit(amount: number): Promise<WalletState> {
  return apiPost<WalletState>('/deposit', { amount });
}

export function withdraw(amount: number): Promise<WalletState> {
  return apiPost<WalletState>('/withdraw', { amount });
}

export function invest(amount: number): Promise<WalletState> {
  return apiPost<WalletState>('/invest', { amount });
}

export function withdrawInvested(amount: number): Promise<WalletState> {
  return apiPost<WalletState>('/withdraw-invested', { amount });
}

export function withdrawAllInvested(): Promise<WalletState> {
  return apiPost<WalletState>('/withdraw-all-invested');
}

export function setFundStrategy(strategy: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/strategy', { strategy });
}
