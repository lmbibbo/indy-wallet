import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MtAccountStatus } from '../types';

interface Props {
  connected: boolean;
  account: MtAccountStatus | null;
  onReconnect: () => void;
}

export default function MtStatus({ connected, account, onReconnect }: Props) {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={[styles.badge, connected ? styles.connected : styles.disconnected]}
        onPress={onReconnect}
      >
        <View
          style={[
            styles.dot,
            { backgroundColor: connected ? '#10b981' : '#ef4444' },
          ]}
        />
        <Text style={[styles.label, { color: connected ? '#10b981' : '#ef4444' }]}>
          MT4: {connected ? 'Conectado' : 'Desconectado'}
        </Text>
      </TouchableOpacity>

      {account && account.MSG && (
        <View style={styles.details}>
          <Text style={styles.detailsTitle}>Cuenta MT4</Text>
          <View style={styles.grid}>
            <Field label="Balance" value={account.BALANCE} />
            <Field label="Equity" value={account.EQUITY} />
            <Field label="Profit" value={account.PROFIT} isCurrency positive />
            <Field label="Credit" value={account.CREDIT} />
            <Field label="Margin" value={account.MARGIN} />
            <Field label="Margen Libre" value={account.MARGIN_FREE} />
            <Field label="Nivel Margen" value={account.MARGIN_LEVEL} suffix="%" />
          </View>
        </View>
      )}
    </View>
  );
}

function Field({
  label,
  value,
  isCurrency,
  positive,
  suffix,
}: {
  label: string;
  value?: number;
  isCurrency?: boolean;
  positive?: boolean;
  suffix?: string;
}) {
  const color =
    isCurrency && value
      ? value >= 0
        ? '#10b981'
        : '#ef4444'
      : '#f8fafc';
  const formatted = value?.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={[styles.fieldValue, { color }]}>
        {value !== undefined && value !== null
          ? `${isCurrency ? '$' : ''}${formatted}${suffix || ''}`
          : '—'}
      </Text>
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  connected: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  disconnected: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  details: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  detailsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  field: {
    width: '30%',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 6,
  },
  fieldLabel: {
    fontSize: 9,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
});
