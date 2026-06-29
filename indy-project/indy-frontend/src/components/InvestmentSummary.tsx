import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
  const formattedInvested = investedAmount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedCurrent = currentBalance.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Mis Inversiones</Text>
      <View style={styles.grid}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Monto Invertido</Text>
          <Text style={styles.metricValue}>${formattedInvested}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Valor Actual</Text>
          <Text style={styles.metricValue}>${formattedCurrent}</Text>
        </View>
      </View>

      {investedAmount > 0 && onWithdrawInvest && (
        <TouchableOpacity style={styles.withdrawBtn} onPress={onWithdrawInvest}>
          <Text style={styles.withdrawBtnText}>
            Retirar Inversión
          </Text>
        </TouchableOpacity>
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
    flexWrap: 'wrap',
    gap: 8,
  },
  metric: {
    width: '48%',
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
