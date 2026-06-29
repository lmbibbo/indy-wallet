import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { STRATEGIES } from '../constants/strategies';
import Tooltip from './Tooltip';

const STRATEGY_LABELS: Record<string, { label: string; tip: string }> = {
  conservative: {
    label: 'Conservador',
    tip: 'Fondo remunerado de alta liquidez. Sin fluctuaciones de capital.',
  },
  moderate: {
    label: 'Moderado',
    tip: 'Fondo mixto balanceado. Combina renta fija e instrumentos corporativos.',
  },
  aggressive: {
    label: 'Agresivo',
    tip: 'Fondo de alta volatilidad basado en activos globales y criptomonedas.',
  },
};

interface Props {
  activeKey: string;
  onChange: (key: string) => void;
}

export default function StrategySelector({ activeKey, onChange }: Props) {
  const current = STRATEGIES[activeKey];

  return (
    <View style={styles.card}>
      <Tooltip label="Estrategia de rendimiento activa. Define tu tasa de interés diaria.">
        <Text style={styles.title}>Estrategia de Inversión</Text>
      </Tooltip>
      <Text style={styles.desc}>
        Elige dónde colocar tus fondos para definir tu tasa de interés diario.
      </Text>

      <View style={styles.tabs}>
        {Object.entries(STRATEGIES).map(([key, s]) => (
          <Tooltip key={key} label={STRATEGY_LABELS[key]?.tip || ''}>
            <TouchableOpacity
              style={[styles.tab, activeKey === key && styles.tabActive]}
              onPress={() => onChange(key)}
            >
              <Text
                style={[
                  styles.tabTitle,
                  activeKey === key && styles.tabTitleActive,
                ]}
              >
                {STRATEGY_LABELS[key]?.label || key}
              </Text>
              <Text
                style={[
                  styles.tabApy,
                  activeKey === key && styles.tabApyActive,
                ]}
              >
                {s.tna}% TNA
              </Text>
            </TouchableOpacity>
          </Tooltip>
        ))}
      </View>

      <View style={styles.details}>
        <View style={styles.badgeRow}>
          <Tooltip label="Nivel de riesgo de la estrategia seleccionada">
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    current.riskClass === 'badge-low'
                      ? 'rgba(16,185,129,0.1)'
                      : current.riskClass === 'badge-medium'
                        ? 'rgba(245,158,11,0.1)'
                        : 'rgba(239,68,68,0.1)',
                  borderColor:
                    current.riskClass === 'badge-low'
                      ? 'rgba(16,185,129,0.2)'
                      : current.riskClass === 'badge-medium'
                        ? 'rgba(245,158,11,0.2)'
                        : 'rgba(239,68,68,0.2)',
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color:
                      current.riskClass === 'badge-low'
                        ? '#10b981'
                        : current.riskClass === 'badge-medium'
                          ? '#f59e0b'
                          : '#ef4444',
                  },
                ]}
              >
                {current.riskText}
              </Text>
            </View>
          </Tooltip>
          <Tooltip label="Tasa de interés diaria estimada según la estrategia">
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: 'rgba(6,182,212,0.1)',
                  borderColor: 'rgba(6,182,212,0.2)',
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: '#06b6d4' }]}>
                Tasa Diaria: ~{(current.dailyRate * 100).toFixed(4)}%
              </Text>
            </View>
          </Tooltip>
        </View>

        <Text style={styles.description}>{current.description}</Text>

        <View style={styles.metrics}>
          <Tooltip label="Tasa Nominal Anual de la estrategia activa">
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Rendimiento Anual (TNA)</Text>
              <Text style={styles.metricValue}>{current.tna.toFixed(1)}%</Text>
            </View>
          </Tooltip>
          <Tooltip label="Ganancia diaria estimada por cada $10,000 invertidos">
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Ganancia Diaria Est. (por c/$10k)</Text>
              <Text style={styles.metricValue}>
                ${(10000 * current.dailyRate).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </Tooltip>
        </View>
      </View>
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
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
    lineHeight: 18,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  tabTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabTitleActive: {
    color: '#f8fafc',
  },
  tabApy: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  tabApyActive: {
    color: '#5f5ef3',
    fontWeight: '700',
  },
  details: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 16,
  },
  metrics: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
    flexDirection: 'row',
    gap: 12,
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
});
