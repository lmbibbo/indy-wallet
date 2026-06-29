import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import * as api from '../api/wallet';
import { WalletState, Transaction, ProjectionPoint, MtAccountStatus } from '../types';
import { STRATEGIES } from '../constants/strategies';
import BalanceCard from '../components/BalanceCard';
import InvestmentSummary from '../components/InvestmentSummary';
import MtStatus from '../components/MtStatus';
import StrategySelector from '../components/StrategySelector';
import SimulatorCard from '../components/SimulatorCard';
import ChartCard from '../components/ChartCard';
import LedgerCard from '../components/LedgerCard';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import InvestModal from '../components/InvestModal';

export default function DashboardScreen() {
  const [state, setState] = useState<WalletState | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [projectionLabels, setProjectionLabels] = useState<string[]>([]);
  const [projectionData, setProjectionData] = useState<number[]>([]);
  const [projectedBalance, setProjectedBalance] = useState(0);
  const [projectedEarnings, setProjectedEarnings] = useState(0);
  const [mtAccount, setMtAccount] = useState<MtAccountStatus | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showInvest, setShowInvest] = useState(false);

  const autoSimRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [s, txs] = await Promise.all([
        api.getStatus(),
        api.getTransactions(),
      ]);
      setState(s);
      setTransactions(txs);
      updateProjection(s.currentStrategy, 90);
    } catch (err: any) {
      console.warn('Error fetching data:', err.message);
    }
  }, []);

  const updateProjection = useCallback(
    async (strategy: string, days: number) => {
      try {
        setState((prev) =>
          prev ? { ...prev, currentStrategy: strategy } : prev
        );
        const points = await api.getProjection(days);
        setProjectionLabels(points.map((p) => p.label));
        setProjectionData(points.map((p) => p.balance));
        if (points.length > 0) {
          setProjectedBalance(points[points.length - 1].balance);
          setProjectedEarnings(points[points.length - 1].earnings);
        }
      } catch (err: any) {
        console.warn('Error loading projection:', err.message);
      }
    },
    []
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, [fetchAll]);

  const handleDeposit = async (amount: number) => {
    try {
      const updated = await api.deposit(amount);
      setState(updated);
      setShowDeposit(false);
      const txs = await api.getTransactions();
      setTransactions(txs);
      updateProjection(updated.currentStrategy, 90);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleWithdraw = async (amount: number) => {
    try {
      const updated = await api.withdraw(amount);
      setState(updated);
      setShowWithdraw(false);
      const txs = await api.getTransactions();
      setTransactions(txs);
      updateProjection(updated.currentStrategy, 90);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleInvest = async (amount: number, strategy: string) => {
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : '';
      const res = await fetch('http://localhost:8080/api/investments/invest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, strategy }),
      });
      if (!res.ok) throw new Error('Investment failed');
      setShowInvest(false);
      const s = await api.getStatus();
      setState(s);
      const txs = await api.getTransactions();
      setTransactions(txs);
      updateProjection(s.currentStrategy, 90);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleStrategyChange = async (key: string) => {
    try {
      const updated = await api.setStrategy(key);
      setState(updated);
      updateProjection(key, 90);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleSimulateDay = async () => {
    try {
      await api.simulateDay();
      const s = await api.getStatus();
      setState(s);
      const txs = await api.getTransactions();
      setTransactions(txs);
      updateProjection(s.currentStrategy, 90);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleToggleAuto = () => {
    if (isSimulating) {
      if (autoSimRef.current) {
        clearInterval(autoSimRef.current);
        autoSimRef.current = null;
      }
      setIsSimulating(false);
    } else {
      setIsSimulating(true);
      autoSimRef.current = setInterval(() => {
        handleSimulateDay();
      }, 600);
    }
  };

  const handleWithdrawInvest = async () => {
    const amount = state?.investedAmount ?? 0;
    if (amount <= 0) return;
    try {
      const updated = await api.withdrawInvested(amount);
      setState(updated);
      const txs = await api.getTransactions();
      setTransactions(txs);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDaysChange = (days: number) => {
    if (state) {
      updateProjection(state.currentStrategy, days);
    }
  };

  const handleReconnect = async () => {
    try {
      const status = await api.getMtStatus();
      if (mtAccount) {
        const updated = { ...mtAccount };
        setMtAccount(updated);
      }
    } catch {
      //
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const balance = state?.balance ?? 0;
  const mtBalance = state?.mtBalance ?? balance;
  const currentStrategy = state?.currentStrategy ?? 'conservative';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>W</Text>
          </View>
          <Text style={styles.appName}>indy</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.statusDot} />
          <Text style={styles.statusLabel}>Mercado Abierto</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>⏻</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#5f5ef3"
          />
        }
      >
        <BalanceCard
          balance={balance}
          onDeposit={() => setShowDeposit(true)}
          onWithdraw={() => setShowWithdraw(true)}
          onInvest={() => setShowInvest(true)}
        />

        {state && (
          <InvestmentSummary
            investedAmount={state.investedAmount}
            currentBalance={mtBalance}
            onWithdrawInvest={state.investedAmount > 0 ? () => handleWithdrawInvest() : undefined}
          />
        )}

        <MtStatus
          connected={state?.mtConnected ?? false}
          account={mtAccount}
          onReconnect={handleReconnect}
        />

        <StrategySelector
          activeKey={currentStrategy}
          onChange={handleStrategyChange}
        />

        <SimulatorCard
          isAdmin={isAdmin}
          isSimulating={isSimulating}
          projectedBalance={projectedBalance}
          projectedEarnings={projectedEarnings}
          onSimulateDay={handleSimulateDay}
          onToggleAuto={handleToggleAuto}
          onDaysChange={handleDaysChange}
        />

        <ChartCard labels={projectionLabels} data={projectionData} />

        <LedgerCard transactions={transactions} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            indy Fintech S.A. — Conectado a la API del Servidor Java Backend
          </Text>
          <Text style={styles.footerCopy}>
            &copy; 2026 indy. Todos los derechos reservados.
          </Text>
        </View>
      </ScrollView>

      <DepositModal
        visible={showDeposit}
        onClose={() => setShowDeposit(false)}
        onConfirm={handleDeposit}
      />
      <WithdrawModal
        visible={showWithdraw}
        balance={balance}
        onClose={() => setShowWithdraw(false)}
        onConfirm={handleWithdraw}
      />
      <InvestModal
        visible={showInvest}
        balance={balance}
        onClose={() => setShowInvest(false)}
        onConfirm={handleInvest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#5f5ef3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  logoutBtn: {
    marginLeft: 4,
    padding: 4,
  },
  logoutIcon: {
    color: '#64748b',
    fontSize: 14,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 20,
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  footerCopy: {
    fontSize: 11,
    color: '#64748b',
    opacity: 0.6,
  },
});
