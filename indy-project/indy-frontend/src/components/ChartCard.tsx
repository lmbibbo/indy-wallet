import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { Path, Line, Svg } from 'react-native-svg';
import Tooltip from './Tooltip';

interface Props {
  labels: string[];
  data: number[];
}

function SimpleLineChart({ data, width, height }: { data: number[]; width: number; height: number }) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 20;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;
  const stepX = chartW / (data.length - 1);

  const points = data.map((v, i) => ({
    x: padding + i * stepX,
    y: padding + chartH - ((v - min) / range) * chartH,
  }));

  const pathD = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');

  const gridLines = [0.25, 0.5, 0.75].map((frac) => ({
    y: padding + chartH - frac * chartH,
  }));

  return (
    <Svg width={width} height={height}>
      {gridLines.map((g, i) => (
        <Line
          key={i}
          x1={padding}
          y1={g.y}
          x2={width - padding}
          y2={g.y}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
        />
      ))}
      <Path
        d={pathD}
        stroke="#6366f1"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function ChartCard({ labels, data }: Props) {
  const screenWidth = Dimensions.get('window').width - 64;

  if (data.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Proyección de Crecimiento</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Sin datos</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Tooltip label="Gráfico de proyección de crecimiento del saldo">
          <Text style={styles.title}>Proyección de Crecimiento</Text>
        </Tooltip>
        <Tooltip label="Línea que muestra la evolución del saldo proyectado">
          <View style={styles.legend}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>Saldo Proyectado</Text>
          </View>
        </Tooltip>
      </View>
      <SimpleLineChart data={data} width={screenWidth} height={180} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5f5ef3',
    shadowColor: '#5f5ef3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  legendText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  empty: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
});
