import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from './Slider';

interface Props {
  isAdmin: boolean;
  isSimulating: boolean;
  projectedBalance: number;
  projectedEarnings: number;
  onSimulateDay: () => void;
  onToggleAuto: () => void;
  onDaysChange: (days: number) => void;
}

export default function SimulatorCard({
  isAdmin,
  isSimulating,
  projectedBalance,
  projectedEarnings,
  onSimulateDay,
  onToggleAuto,
  onDaysChange,
}: Props) {
  const [days, setDays] = useState(90);

  const handleChange = (val: number) => {
    setDays(val);
    onDaysChange(val);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Simulador de Tiempo y Rendimiento</Text>
      <Text style={styles.desc}>
        Acelera el paso del tiempo para ver el poder del interés compuesto diario.
      </Text>

      <View style={styles.sliderSection}>
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>Horizonte de Simulación</Text>
          <Text style={styles.sliderValue}>{days} días</Text>
        </View>
        <Slider min={10} max={365} value={days} onChange={handleChange} />
        <View style={styles.ticks}>
          {['10d', '90d', '180d', '270d', '365d'].map((t, i) => (
            <Text key={i} style={styles.tick}>
              {t}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnOutline} onPress={onSimulateDay}>
          <Text style={styles.btnOutlineText}>+ Simular +1 Día</Text>
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity
            style={[styles.btnGlow, isSimulating && styles.btnGlowActive]}
            onPress={onToggleAuto}
          >
            <Text style={styles.btnGlowText}>
              {isSimulating ? 'Detener' : 'Auto'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.projection}>
        <View style={styles.projCol}>
          <Text style={styles.projLabel}>Saldo Proyectado</Text>
          <Text style={styles.projVal}>
            ${projectedBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.projCol}>
          <Text style={styles.projLabel}>Intereses Ganados</Text>
          <Text style={[styles.projVal, { color: '#10b981' }]}>
            +${projectedEarnings.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
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
  sliderSection: {
    marginBottom: 16,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  sliderValue: {
    fontSize: 14,
    color: '#5f5ef3',
    fontWeight: '700',
  },
  ticks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  tick: {
    fontSize: 11,
    color: '#64748b',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  btnOutline: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnOutlineText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  btnGlow: {
    backgroundColor: '#5f5ef3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#5f5ef3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnGlowActive: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
  },
  btnGlowText: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 13,
  },
  projection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    padding: 16,
  },
  projCol: {
    flex: 1,
    alignItems: 'center',
  },
  projLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  projVal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 12,
  },
});
