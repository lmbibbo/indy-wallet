import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
}

export default function LedgerCard({ transactions }: Props) {
  const renderItem = ({ item }: { item: Transaction }) => {
    const isDeposit = item.type === 'deposit';
    const isWithdraw = item.type === 'withdraw';
    const prefix = isWithdraw ? '-' : '+';

    return (
      <View style={[styles.item, item.isFresh && styles.fresh]}>
        <View style={styles.left}>
          <View
            style={[
              styles.icon,
              {
                backgroundColor: isDeposit
                  ? 'rgba(6,182,212,0.1)'
                  : isWithdraw
                    ? 'rgba(239,68,68,0.1)'
                    : 'rgba(16,185,129,0.1)',
                borderColor: isDeposit
                  ? 'rgba(6,182,212,0.15)'
                  : isWithdraw
                    ? 'rgba(239,68,68,0.15)'
                    : 'rgba(16,185,129,0.15)',
              },
            ]}
          >
            <Text
              style={{
                fontSize: 14,
                color: isDeposit
                  ? '#06b6d4'
                  : isWithdraw
                    ? '#ef4444'
                    : '#10b981',
              }}
            >
              {isDeposit ? '↓' : isWithdraw ? '↑' : '↗'}
            </Text>
          </View>
          <View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
        </View>
        <Text
          style={[
            styles.amount,
            { color: isWithdraw ? '#ef4444' : '#10b981' },
          ]}
        >
          {prefix}${Math.abs(item.amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Actividad de Cuenta (Real)</Text>
      <View style={styles.listContainer}>
        {transactions.length === 0 ? (
          <Text style={styles.empty}>Sin transacciones</Text>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          />
        )}
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 12,
  },
  listContainer: {
    maxHeight: 280,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    padding: 6,
  },
  list: {
    gap: 6,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
    borderRadius: 10,
  },
  fresh: {
    borderColor: 'rgba(16,185,129,0.3)',
    backgroundColor: 'rgba(16,185,129,0.02)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f8fafc',
  },
  date: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
  },
  empty: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
});
