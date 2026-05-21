import { Chart, registerables } from 'chart.js';
import { WalletState, Transaction, StrategyDetails, ProjectionPoint } from './types';

Chart.register(...registerables);

const BACKEND_URL = 'http://localhost:8080/api/wallet';

// --- CONFIGURACIÓN DE FONDOS DE INVERSIÓN (Igual a Backend) ---
const STRATEGIES: Record<string, StrategyDetails> = {
    conservative: {
        tna: 70.0,
        riskText: 'Riesgo Bajo',
        riskClass: 'badge-low',
        description: 'Fondo remunerado de alta liquidez. Ideal para tener disponibilidad de tu saldo las 24 hs sin fluctuaciones de capital.',
        dailyRate: 0.70 / 365,
        volatility: 0.00
    },
    moderate: {
        tna: 95.0,
        riskText: 'Riesgo Medio',
        riskClass: 'badge-medium',
        description: 'Fondo mixto balanceado. Combina renta fija e instrumentos corporativos para maximizar tus rendimientos sin exponer demasiado capital.',
        dailyRate: 0.95 / 365,
        volatility: 0.0005
    },
    aggressive: {
        tna: 140.0,
        riskText: 'Riesgo Alto',
        riskClass: 'badge-high',
        description: 'Fondo de alta volatilidad basado en activos globales y criptomonedas. Obtén rendimientos espectaculares asumiendo pequeñas fluctuaciones diarias.',
        dailyRate: 1.40 / 365,
        volatility: 0.0035
    }
};

// --- ESTADO LOCAL ---
let localState: WalletState = {
    balance: 0.00,
    totalEarnings: 0.00,
    currentStrategy: 'conservative',
    todayEarnings: 0.000000,
    simulatedDaysCount: 0
};

let activeStrategyKey = 'conservative';
let isAutoSimulating = false;
let autoSimInterval: number | undefined = undefined;
let growthChart: Chart | null = null;

// --- ELEMENTOS DEL DOM ---
const getEl = <T extends HTMLElement>(id: string): T => {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Elemento no encontrado: ${id}`);
    return el as T;
};

// Elementos de UI
let elMainBalance: HTMLSpanElement;
let elLiveTodayEarnings: HTMLSpanElement;
let elBtnDepositTrigger: HTMLButtonElement;
let elBtnWithdrawTrigger: HTMLButtonElement;

let elStratConservative: HTMLButtonElement;
let elStratModerate: HTMLButtonElement;
let elStratAggressive: HTMLButtonElement;

let elRiskBadge: HTMLSpanElement;
let elYieldBadge: HTMLSpanElement;
let elStrategyDescription: HTMLParagraphElement;
let elMetricTna: HTMLSpanElement;
let elMetricDailyEst: HTMLSpanElement;

let elSimulatorDaysRange: HTMLInputElement;
let elSimulationDaysLabel: HTMLSpanElement;
let elBtnAddDay: HTMLButtonElement;
let elBtnAutoSimulate: HTMLButtonElement;

let elProjectedBalance: HTMLSpanElement;
let elProjectedEarnings: HTMLSpanElement;
let elLedgerList: HTMLDivElement;

// Modales
let elModalDeposit: HTMLDivElement;
let elModalWithdraw: HTMLDivElement;
let elBtnDepositClose: HTMLButtonElement;
let elBtnWithdrawClose: HTMLButtonElement;
let elBtnDepositConfirm: HTMLButtonElement;
let elBtnWithdrawConfirm: HTMLButtonElement;
let elDepositAmountInput: HTMLInputElement;
let elWithdrawAmountInput: HTMLInputElement;
let elWithdrawMaxHint: HTMLSpanElement;

// --- INICIALIZACIÓN DE ELEMENTOS ---
function initDOMElements() {
    elMainBalance = getEl<HTMLSpanElement>('main-balance');
    elLiveTodayEarnings = getEl<HTMLSpanElement>('live-today-earnings');
    elBtnDepositTrigger = getEl<HTMLButtonElement>('btn-deposit-trigger');
    elBtnWithdrawTrigger = getEl<HTMLButtonElement>('btn-withdraw-trigger');

    elStratConservative = getEl<HTMLButtonElement>('strat-conservative');
    elStratModerate = getEl<HTMLButtonElement>('strat-moderate');
    elStratAggressive = getEl<HTMLButtonElement>('strat-aggressive');

    elRiskBadge = getEl<HTMLSpanElement>('risk-badge');
    elYieldBadge = getEl<HTMLSpanElement>('yield-badge');
    elStrategyDescription = getEl<HTMLParagraphElement>('strategy-description');
    elMetricTna = getEl<HTMLSpanElement>('metric-tna');
    elMetricDailyEst = getEl<HTMLSpanElement>('metric-daily-est');

    elSimulatorDaysRange = getEl<HTMLInputElement>('simulator-days-range');
    elSimulationDaysLabel = getEl<HTMLSpanElement>('simulation-days-label');
    elBtnAddDay = getEl<HTMLButtonElement>('btn-add-day');
    elBtnAutoSimulate = getEl<HTMLButtonElement>('btn-auto-simulate');

    elProjectedBalance = getEl<HTMLSpanElement>('projected-balance');
    elProjectedEarnings = getEl<HTMLSpanElement>('projected-earnings');
    elLedgerList = getEl<HTMLDivElement>('ledger-list');

    elModalDeposit = getEl<HTMLDivElement>('modal-deposit');
    elModalWithdraw = getEl<HTMLDivElement>('modal-withdraw');
    elBtnDepositClose = getEl<HTMLButtonElement>('btn-deposit-close');
    elBtnWithdrawClose = getEl<HTMLButtonElement>('btn-withdraw-close');
    elBtnDepositConfirm = getEl<HTMLButtonElement>('btn-deposit-confirm');
    elBtnWithdrawConfirm = getEl<HTMLButtonElement>('btn-withdraw-confirm');
    elDepositAmountInput = getEl<HTMLInputElement>('deposit-amount');
    elWithdrawAmountInput = getEl<HTMLInputElement>('withdraw-amount');
    elWithdrawMaxHint = getEl<HTMLSpanElement>('withdraw-max-hint');
}

// --- LLAMADAS API AL BACKEND ---

async function apiGet<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${BACKEND_URL}${endpoint}`);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }
    return res.json() as Promise<T>;
}

async function apiPost<T>(endpoint: string, body?: object): Promise<T> {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }
    return res.json() as Promise<T>;
}

// --- ACTUALIZACIÓN DE SALDOS E INTERFAZ ---

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function updateState(newState: WalletState) {
    localState = { ...newState };
    activeStrategyKey = localState.currentStrategy.toLowerCase();

    // Renderizar balance
    elMainBalance.textContent = formatCurrency(localState.balance);
    elWithdrawMaxHint.textContent = `$${formatCurrency(localState.balance)}`;
    elWithdrawAmountInput.placeholder = `Máx. $${formatCurrency(localState.balance)}`;
}

// --- LOGICA DE ESTRATEGIA ---

function updateStrategyDetails() {
    const strat = STRATEGIES[activeStrategyKey];
    if (!strat) return;

    elRiskBadge.textContent = strat.riskText;
    elRiskBadge.className = `badge ${strat.riskClass}`;

    const dailyPercent = (strat.dailyRate * 100).toFixed(4);
    elYieldBadge.textContent = `Tasa Diaria: ~${dailyPercent}%`;
    elStrategyDescription.textContent = strat.description;
    elMetricTna.textContent = `${strat.tna.toFixed(1)}%`;

    const dailyEst = 10000 * strat.dailyRate;
    elMetricDailyEst.textContent = `$${formatCurrency(dailyEst)}`;

    // Tab activas
    [elStratConservative, elStratModerate, elStratAggressive].forEach(tab => {
        if (tab.dataset.strategy === activeStrategyKey) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

// --- BITÁCORA DE TRANSACCIONES ---

async function loadTransactions() {
    try {
        const txs = await apiGet<Transaction[]>('/transactions');
        elLedgerList.innerHTML = '';

        txs.forEach(tx => {
            const item = document.createElement('div');
            item.className = `ledger-item ${tx.isFresh ? 'fresh' : ''}`;

            let iconClass = 'fa-solid fa-coins icon-interest';
            let amountClass = 'amount-positive';
            let amountPrefix = '+';

            if (tx.type === 'deposit') {
                iconClass = 'fa-solid fa-circle-arrow-down icon-deposit';
                amountClass = 'amount-positive';
                amountPrefix = '+';
            } else if (tx.type === 'withdraw') {
                iconClass = 'fa-solid fa-circle-arrow-up icon-withdraw';
                amountClass = 'amount-negative';
                amountPrefix = '-';
            }

            item.innerHTML = `
                <div class="ledger-left">
                    <div class="ledger-icon ${iconClass.split(' ')[2]}">
                        <i class="${iconClass.split(' ')[0]} ${iconClass.split(' ')[1]}"></i>
                    </div>
                    <div class="ledger-meta">
                        <span class="ledger-title">${tx.title}</span>
                        <span class="ledger-date">${tx.date}</span>
                    </div>
                </div>
                <div class="ledger-right">
                    <span class="ledger-amount ${amountClass}">
                        ${amountPrefix}$${formatCurrency(Math.abs(tx.amount))}
                    </span>
                </div>
            `;
            elLedgerList.appendChild(item);
        });
    } catch (err) {
        console.error('Error cargando transacciones:', err);
    }
}

// --- ACTUALIZACIÓN DE PROYECCIÓN Y GRÁFICO ---

async function loadProjections() {
    try {
        const horizonDays = parseInt(elSimulatorDaysRange.value);
        elSimulationDaysLabel.textContent = `${horizonDays} días`;

        const points = await apiGet<ProjectionPoint[]>(`/projection?days=${horizonDays}`);
        
        const labels = points.map(p => p.label);
        const data = points.map(p => p.balance);

        const lastPoint = points[points.length - 1];
        if (lastPoint) {
            elProjectedBalance.textContent = `$${formatCurrency(lastPoint.balance)}`;
            elProjectedEarnings.textContent = `+$${formatCurrency(lastPoint.earnings)}`;
        }

        updateChart(labels, data);
    } catch (err) {
        console.error('Error cargando proyecciones:', err);
    }
}

// --- DIBUJADO DE GRÁFICO ---

function initChart() {
    const canvas = getEl<HTMLCanvasElement>('growthChart');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Saldo Proyectado',
                data: [],
                borderColor: '#6366f1',
                borderWidth: 3,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 1.5,
                pointRadius: 0,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#11131f',
                    titleColor: '#94a3b8',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return ` Saldo: $${formatCurrency(context.parsed.y ?? 0)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#64748b',
                        font: { family: 'Inter', size: 10 }
                    }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.04)' },
                    ticks: {
                        color: '#64748b',
                        font: { family: 'Inter', size: 10 },
                        callback: function(value) {
                            return '$' + value.toLocaleString('es-AR', { maximumFractionDigits: 0 });
                        }
                    }
                }
            }
        }
    });
}

function updateChart(labels: string[], data: number[]) {
    if (!growthChart) return;
    growthChart.data.labels = labels;
    growthChart.data.datasets[0].data = data;
    growthChart.update('active');
}

// --- TICKER DE RENDIMIENTO EN VIVO ---

function startLiveTicker() {
    const TICK_INTERVAL_MS = 50;

    setInterval(() => {
        const strat = STRATEGIES[activeStrategyKey];
        if (!strat || localState.balance <= 0) return;

        const stepsPerDay = (24 * 60 * 60 * 1000) / TICK_INTERVAL_MS;
        const earningsPerTick = (localState.balance * strat.dailyRate) / stepsPerDay;

        localState.todayEarnings += earningsPerTick;
        elLiveTodayEarnings.textContent = localState.todayEarnings.toFixed(6);
    }, TICK_INTERVAL_MS);
}

// --- ACCIONES DE FORMULARIO ---

async function simulateDay() {
    try {
        const updated = await apiPost<WalletState>('/simulate-day');
        updateState(updated);
        
        // Destello visual en el balance
        elMainBalance.classList.add('balance-flash-up');
        setTimeout(() => {
            elMainBalance.classList.remove('balance-flash-up');
        }, 600);

        await loadTransactions();
        await loadProjections();
    } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Error desconocido';
        alert(`Error al simular día: ${errMsg}`);
    }
}

async function handleDeposit() {
    const amount = parseFloat(elDepositAmountInput.value);
    if (isNaN(amount) || amount <= 0) {
        alert('Por favor ingresa un monto válido.');
        return;
    }

    try {
        const updated = await apiPost<WalletState>('/deposit', { amount });
        updateState(updated);
        
        elDepositAmountInput.value = '50000';
        elModalDeposit.classList.remove('active');

        await loadTransactions();
        await loadProjections();
    } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Error desconocido';
        alert(`Error en depósito: ${errMsg}`);
    }
}

async function handleWithdraw() {
    const amount = parseFloat(elWithdrawAmountInput.value);
    if (isNaN(amount) || amount <= 0) {
        alert('Por favor ingresa un monto válido.');
        return;
    }

    if (amount > localState.balance) {
        alert('Saldo insuficiente para esta extracción.');
        return;
    }

    try {
        const updated = await apiPost<WalletState>('/withdraw', { amount });
        updateState(updated);

        elWithdrawAmountInput.value = '';
        elModalWithdraw.classList.remove('active');

        await loadTransactions();
        await loadProjections();
    } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Error desconocido';
        alert(`Error en extracción: ${errMsg}`);
    }
}

async function setStrategy(strat: string) {
    try {
        const updated = await apiPost<WalletState>('/strategy', { strategy: strat });
        updateState(updated);
        updateStrategyDetails();
        await loadProjections();
    } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Error desconocido';
        alert(`Error al cambiar de fondo: ${errMsg}`);
    }
}

// --- CONECTAR MANEJADORES DE EVENTOS ---

function bindEvents() {
    // Tabs de fondos
    elStratConservative.addEventListener('click', () => setStrategy('conservative'));
    elStratModerate.addEventListener('click', () => setStrategy('moderate'));
    elStratAggressive.addEventListener('click', () => setStrategy('aggressive'));

    // Slider
    elSimulatorDaysRange.addEventListener('input', () => {
        loadProjections();
    });

    // Simular +1 día
    elBtnAddDay.addEventListener('click', () => simulateDay());

    // Auto-Simular
    elBtnAutoSimulate.addEventListener('click', () => {
        if (isAutoSimulating) {
            isAutoSimulating = false;
            if (autoSimInterval !== undefined) {
                clearInterval(autoSimInterval);
                autoSimInterval = undefined;
            }
            elBtnAutoSimulate.innerHTML = '<i class="fa-solid fa-play"></i> Simulación Rápida (Auto)';
            elBtnAutoSimulate.classList.remove('simulating');
        } else {
            isAutoSimulating = true;
            elBtnAutoSimulate.innerHTML = '<i class="fa-solid fa-pause"></i> Detener Simulación';
            elBtnAutoSimulate.classList.add('simulating');
            autoSimInterval = window.setInterval(() => {
                simulateDay();
            }, 600);
        }
    });

    // Modales disparadores
    elBtnDepositTrigger.addEventListener('click', () => elModalDeposit.classList.add('active'));
    elBtnWithdrawTrigger.addEventListener('click', () => elModalWithdraw.classList.add('active'));

    // Cerrar Modales
    elBtnDepositClose.addEventListener('click', () => elModalDeposit.classList.remove('active'));
    elBtnWithdrawClose.addEventListener('click', () => elModalWithdraw.classList.remove('active'));

    elBtnDepositConfirm.addEventListener('click', handleDeposit);
    elBtnWithdrawConfirm.addEventListener('click', handleWithdraw);

    window.addEventListener('click', (e) => {
        if (e.target === elModalDeposit) elModalDeposit.classList.remove('active');
        if (e.target === elModalWithdraw) elModalWithdraw.classList.remove('active');
    });
}

// --- INICIO ---

async function start() {
    try {
        initDOMElements();
        initChart();
        bindEvents();

        // Cargar estado inicial del backend
        const initialStatus = await apiGet<WalletState>('/status');
        updateState(initialStatus);
        updateStrategyDetails();

        await loadTransactions();
        await loadProjections();

        startLiveTicker();
    } catch (err: unknown) {
        console.error('Error al inicializar la billetera:', err);
        const elContainer = document.querySelector('.app-container');
        if (elContainer) {
            const errorBanner = document.createElement('div');
            errorBanner.style.background = 'rgba(239, 68, 68, 0.15)';
            errorBanner.style.color = '#ef4444';
            errorBanner.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            errorBanner.style.borderRadius = '12px';
            errorBanner.style.padding = '1rem';
            errorBanner.style.marginBottom = '1.5rem';
            errorBanner.style.textAlign = 'center';
            errorBanner.innerHTML = `
                <h4 style="margin-bottom: 0.25rem"><i class="fa-solid fa-triangle-exclamation"></i> Error de conexión con el Servidor</h4>
                <p style="font-size: 0.85rem; color: #94a3b8">Por favor, asegúrate de haber levantado el backend de Java (Spring Boot) en el puerto 8080 antes de correr el frontend.</p>
            `;
            elContainer.insertBefore(errorBanner, elContainer.firstChild);
        }
    }
}

window.addEventListener('load', start);
