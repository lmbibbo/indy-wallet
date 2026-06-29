import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Tooltip from './Tooltip';

interface Props {
  balance: number;
  onDeposit: () => void;
  onWithdraw: () => void;
  onInvest: () => void;
}

export default function BalanceCard({ balance, onDeposit, onWithdraw, onInvest }: Props) {
  const formatted = balance.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Tooltip label="Saldo disponible actual en tu billetera">
          <Text style={styles.subtitle}>
            <Text style={styles.subtitleIcon}>{'  '}Saldo Disponible</Text>
          </Text>
        </Tooltip>
        <Tooltip label="Moneda: Peso Argentino">
          <Text style={styles.currencyBadge}>ARS / $</Text>
        </Tooltip>
      </View>

      <Tooltip label="Tu saldo actual en ARS">
        <View style={styles.balanceRow}>
          <Text style={styles.balanceSign}>$</Text>
          <Text style={styles.balanceAmount}>{formatted}</Text>
        </View>
      </Tooltip>

      <View style={styles.actions}>
        <Tooltip label="Simular un depósito de fondos" style={{ flex: 1 }}>
          <TouchableOpacity style={styles.btnPrimary} onPress={onDeposit}>
            <Text style={styles.btnText}>+ Ingresar</Text>
          </TouchableOpacity>
        </Tooltip>
        <Tooltip label="Simular una extracción de fondos" style={{ flex: 1 }}>
          <TouchableOpacity style={styles.btnSecondary} onPress={onWithdraw}>
            <Text style={styles.btnText}>- Retirar</Text>
          </TouchableOpacity>
        </Tooltip>
        <Tooltip label="Invertir en el mercado de capitales" style={{ flex: 1 }}>
          <TouchableOpacity style={styles.btnInvest} onPress={onInvest}>
            <Text style={styles.btnInvestText}>Invertir</Text>
          </TouchableOpacity>
        </Tooltip>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(21, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  subtitleIcon: {
    fontSize: 12,
  },
  currencyBadge: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  balanceSign: {
    fontSize: 28,
    fontWeight: '500',
    color: '#94a3b8',
    marginRight: 4,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
    color: '#f8fafc',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#5f5ef3',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#5f5ef3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  btnInvest: {
    flex: 1,
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnText: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 13,
  },
  btnInvestText: {
    color: '#1a1a2e',
    fontWeight: '600',
    fontSize: 13,
  },
});
