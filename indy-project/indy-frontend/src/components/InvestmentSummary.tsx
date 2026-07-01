import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Tooltip from './Tooltip';

interface Props {
  userInvestedValue: number;
  userInvestedAmount: number;
  fundTotalValue: number;
  userPercentage: number;
  onWithdrawAll?: () => void;
}

export default function InvestmentSummary({
  userInvestedValue = 0,
  userInvestedAmount = 0,
  fundTotalValue = 0,
  userPercentage = 0,
  onWithdrawAll,
}: Props) {
  const difference = userInvestedValue - userInvestedAmount;
  const diffColor = difference >= 0 ? '#10b981' : '#ef4444';
  const diffSign = difference >= 0 ? '+' : '';

  const formattedInvested = userInvestedAmount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedValue = userInvestedValue.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedDiff = difference.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedFund = fundTotalValue.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View style={styles.card}>
      <Tooltip label="Resumen de tu participación en el Fondo Común de Inversión">
        <Text style={styles.title}>Mi Participación en el Fondo</Text>
      </Tooltip>
      <View style={styles.grid}>
        <Tooltip label="Capital que has aportado al fondo" style={{ flex: 1 }}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Aportado</Text>
            <Text style={styles.metricValue}>${formattedInvested}</Text>
          </View>
        </Tooltip>
        <Tooltip label="Valor actual de tu participación en el fondo" style={{ flex: 1 }}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Valor Actual</Text>
            <Text style={styles.metricValue}>${formattedValue}</Text>
          </View>
        </Tooltip>
        <Tooltip label="Diferencia entre valor actual y lo aportado" style={{ flex: 1 }}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Diferencia</Text>
            <Text style={[styles.metricValue, { color: diffColor }]}>
              {diffSign}${formattedDiff}
            </Text>
          </View>
        </Tooltip>
      </View>
      <View style={styles.poolRow}>
        <Text style={styles.poolText}>
          Fondo Común: ${formattedFund} | Tu porción: {userPercentage.toFixed(2)}%
        </Text>
      </View>

      {userInvestedValue > 0 && onWithdrawAll && (
        <Tooltip label="Retirar el total de tu capital invertido del fondo">
          <TouchableOpacity style={styles.withdrawBtn} onPress={onWithdrawAll}>
            <Text style={styles.withdrawBtnText}>
              Retirar Inversión Total
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
  poolRow: {
    marginTop: 8,
    backgroundColor: 'rgba(99,102,241,0.08)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  poolText: {
    fontSize: 12,
    color: '#94a3b8',
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
