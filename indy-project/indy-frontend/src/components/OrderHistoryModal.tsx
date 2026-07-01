import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Trade } from '../types';
import * as api from '../api/wallet';
import Tooltip from './Tooltip';

interface Props {
  visible: boolean;
  onClose: () => void;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split(' ');
  return parts[0] || dateStr;
}

function getTypeColor(type: string): string {
  return type === 'buy' ? '#10b981' : '#ef4444';
}

export default function OrderHistoryModal({ visible, onClose }: Props) {
  const [orders, setOrders] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setError('');
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const toStr = today.toISOString().slice(0, 10).replace(/-/g, '.');
    const fromStr = monthAgo.toISOString().slice(0, 10).replace(/-/g, '.');

    api.getMtOrders(fromStr, toStr)
      .then((data) => {
        if (data.TRADES) {
          setOrders(data.TRADES);
        } else {
          setOrders([]);
          if (data.error) setError(data.error);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [visible]);

  const totalProfit = orders.reduce((sum, t) => sum + (t.PROFIT || 0), 0);

  const renderItem = ({ item }: { item: Trade }) => (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <Text style={styles.symbol}>{item.SYMBOL}</Text>
        <Text style={[styles.type, { color: getTypeColor(item.TYPE) }]}>
          {item.TYPE.toUpperCase()}
        </Text>
      </View>
      <View style={styles.itemCenter}>
        <Text style={styles.date}>{formatDate(item.CLOSE_TIME)}</Text>
        <Text style={styles.lots}>{item.LOTS} lots</Text>
      </View>
      <Text style={[styles.profit, { color: (item.PROFIT || 0) >= 0 ? '#10b981' : '#ef4444' }]}>
        {(item.PROFIT || 0) >= 0 ? '+' : ''}${(item.PROFIT || 0).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Tooltip label="Cerrar">
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeBtn}>X</Text>
              </TouchableOpacity>
            </Tooltip>
            <Text style={styles.title}>Historial de Órdenes (30 días)</Text>
            {!loading && (
              <Text style={[styles.total, { color: totalProfit >= 0 ? '#10b981' : '#ef4444' }]}>
                Total: {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
              </Text>
            )}
          </View>

          {loading ? (
            <ActivityIndicator color="#5f5ef3" style={{ marginTop: 40 }} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : orders.length === 0 ? (
            <Text style={styles.empty}>Sin órdenes en el período</Text>
          ) : (
            <FlatList
              data={orders}
              keyExtractor={(item, i) => `${item.TICKET}-${i}`}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4,5,8,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '92%',
    maxWidth: 500,
    maxHeight: '85%',
    backgroundColor: 'rgba(20,23,40,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  closeBtn: {
    color: '#64748b',
    fontSize: 18,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    flex: 1,
    marginLeft: 8,
  },
  total: {
    fontSize: 14,
    fontWeight: '700',
  },
  list: {
    gap: 6,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  symbol: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  type: {
    fontSize: 10,
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  itemCenter: {
    flex: 1,
    alignItems: 'center',
  },
  date: {
    fontSize: 11,
    color: '#64748b',
  },
  lots: {
    fontSize: 10,
    color: '#64748b',
  },
  profit: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 80,
    textAlign: 'right',
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 20,
  },
  empty: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 20,
  },
});
