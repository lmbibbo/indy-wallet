import { View, Text, StyleSheet } from 'react-native';
import { STRATEGIES } from '../constants/strategies';
import Tooltip from './Tooltip';

interface Props {
  fundStrategy: string;
}

export default function StrategySelector({ fundStrategy }: Props) {
  const current = STRATEGIES[fundStrategy];

  if (!current) return null;

  return (
    <View style={styles.card}>
      <Tooltip label="Estrategia de rendimiento del Fondo Común">
        <Text style={styles.title}>Estrategia del Fondo</Text>
      </Tooltip>
      <Text style={styles.desc}>
        La estrategia de inversión es única para todos los usuarios del Fondo Común.
        Solo un administrador puede cambiarla.
      </Text>

      <View style={styles.activeRow}>
        <Text style={styles.strategyName}>
          {fundStrategy === 'conservative' ? 'Conservador' : fundStrategy === 'moderate' ? 'Moderado' : 'Agresivo'}
        </Text>
        <Text style={styles.tnaText}>{current.tna}% TNA</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.badgeRow}>
          <Tooltip label="Nivel de riesgo de la estrategia activa">
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
          <Tooltip label="Tasa de interés diaria">
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
  activeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  strategyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  tnaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5f5ef3',
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
  },
});
