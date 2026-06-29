import { auth } from '../config/firebase';
import { WalletState, Transaction, ProjectionPoint, MtAccountStatus } from '../types';

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

export function getTransactions(): Promise<Transaction[]> {
  return apiGet<Transaction[]>('/transactions');
}

export function getProjection(days: number): Promise<ProjectionPoint[]> {
  return apiGet<ProjectionPoint[]>(`/projection?days=${days}`);
}

export function getMtAccount(): Promise<MtAccountStatus> {
  return apiGet<MtAccountStatus>('/mt-account');
}

export function getMtStatus(): Promise<{ connected: boolean; lastError: string }> {
  return apiGet<{ connected: boolean; lastError: string }>('/mt-status');
}

export function simulateDay(): Promise<WalletState> {
  return apiPost<WalletState>('/simulate-day');
}

export function deposit(amount: number): Promise<WalletState> {
  return apiPost<WalletState>('/deposit', { amount });
}

export function withdraw(amount: number): Promise<WalletState> {
  return apiPost<WalletState>('/withdraw', { amount });
}

export function setStrategy(strategy: string): Promise<WalletState> {
  return apiPost<WalletState>('/strategy', { strategy });
}

export function initBalance(): Promise<void> {
  return apiPost<void>('/init-balance');
}

export function withdrawInvested(amount: number): Promise<WalletState> {
  return apiPost<WalletState>('/withdraw-invested', { amount });
}
