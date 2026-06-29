import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MtAccountStatus } from '../types';
import Tooltip from './Tooltip';

interface Props {
  connected: boolean;
  account: MtAccountStatus | null;
  onReconnect: () => void;
}

export default function MtStatus({ connected, account, onReconnect }: Props) {
  return (
    <View style={styles.card}>
      <Tooltip label="Estado de conexión con MetaTrader 4. Presiona para reconectar.">
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
      </Tooltip>

      {account && account.MSG && (
        <View style={styles.details}>
          <Tooltip label="Estado de tu cuenta MetaTrader 4 (Caso de Uso 12)">
            <Text style={styles.detailsTitle}>Estado MT4</Text>
          </Tooltip>
          <View style={styles.grid}>
            <Field label="Equity" value={account.EQUITY} isCurrency tip="Capital actual (balance + profit flotante)" />
            <Field label="Profit" value={account.PROFIT} isCurrency tip="Ganancia o pérdida actual" />
            <Field label="Margen" value={account.MARGIN} tip="Margen utilizado en posiciones abiertas" />
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
  suffix,
  tip,
}: {
  label: string;
  value?: number;
  isCurrency?: boolean;
  suffix?: string;
  tip?: string;
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

  const content = (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={[styles.fieldValue, { color }]}>
        {value !== undefined && value !== null
          ? `${isCurrency ? '$' : ''}${formatted}${suffix || ''}`
          : '—'}
      </Text>
    </View>
  );

  if (tip) {
    return <Tooltip label={tip} style={{ flex: 1 }}>{content}</Tooltip>;
  }
  return content;
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
    gap: 6,
  },
  field: {
    flex: 1,
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
