import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Tooltip from './Tooltip';

interface Props {
  investedAmount?: number;
  currentBalance?: number;
  onWithdrawInvest?: () => void;
}

export default function InvestmentSummary({
  investedAmount = 0,
  currentBalance = 0,
  onWithdrawInvest,
}: Props) {
  const difference = currentBalance - investedAmount;
  const diffColor = difference >= 0 ? '#10b981' : '#ef4444';
  const diffSign = difference >= 0 ? '+' : '';

  const formattedInvested = investedAmount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedCurrent = currentBalance.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedDiff = difference.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View style={styles.card}>
      <Tooltip label="Resumen de tus inversiones activas">
        <Text style={styles.title}>Mis Inversiones</Text>
      </Tooltip>
      <View style={styles.grid}>
        <Tooltip label="Capital total que has invertido" style={{ flex: 1 }}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Monto Invertido</Text>
            <Text style={styles.metricValue}>${formattedInvested}</Text>
          </View>
        </Tooltip>
        <Tooltip label="Valor actual de tus inversiones (MT4)" style={{ flex: 1 }}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Valor Actual</Text>
            <Text style={styles.metricValue}>${formattedCurrent}</Text>
          </View>
        </Tooltip>
        <Tooltip label="Diferencia entre valor actual y monto invertido" style={{ flex: 1 }}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Diferencia</Text>
            <Text style={[styles.metricValue, { color: diffColor }]}>
              {diffSign}${formattedDiff}
            </Text>
          </View>
        </Tooltip>
      </View>

      {investedAmount > 0 && onWithdrawInvest && (
        <Tooltip label="Retirar el total de tu capital invertido">
          <TouchableOpacity style={styles.withdrawBtn} onPress={onWithdrawInvest}>
            <Text style={styles.withdrawBtnText}>
              Retirar Inversión
            </Text>
          </TouchableOpacity>
        </Tooltip>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(15, 18, 30, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  metric: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  withdrawBtn: {
    marginTop: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  withdrawBtnText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
});
