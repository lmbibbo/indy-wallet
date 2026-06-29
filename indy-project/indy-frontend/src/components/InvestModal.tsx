import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { STRATEGIES, STRATEGY_KEYS } from '../constants/strategies';
import Tooltip from './Tooltip';

interface Props {
  visible: boolean;
  balance: number;
  onClose: () => void;
  onConfirm: (amount: number, strategy: string) => void;
}

export default function InvestModal({
  visible,
  balance,
  onClose,
  onConfirm,
}: Props) {
  const [amount, setAmount] = useState('');
  const [strategy, setStrategy] = useState('conservative');

  const handleConfirm = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || val > balance) return;
    onConfirm(val, strategy);
    setAmount('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.content}>
          <Tooltip label="Cerrar ventana">
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>X</Text>
            </TouchableOpacity>
          </Tooltip>
          <Tooltip label="Formulario para invertir en el mercado">
            <Text style={styles.title}>Invertir en el Mercado</Text>
          </Tooltip>
          <Text style={styles.desc}>
            Seleccioná el monto y la estrategia para tu inversión.
          </Text>

          <View style={styles.inputGroup}>
            <Tooltip label="Ingresá el monto que deseas invertir">
              <Text style={styles.label}>Monto a invertir (ARS)</Text>
            </Tooltip>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencySign}>$</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#64748b"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
            <Text style={styles.hint}>
              Saldo disponible: $
              {balance.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Tooltip label="Seleccioná la estrategia de inversión">
              <Text style={styles.label}>Estrategia</Text>
            </Tooltip>
            <View style={styles.strategyPicker}>
              {STRATEGY_KEYS.map((key) => (
                <Tooltip
                  key={key}
                  label={key === 'conservative'
                    ? 'Fondo remunerado de alta liquidez. Sin fluctuaciones.'
                    : key === 'moderate'
                      ? 'Fondo mixto balanceado.'
                      : 'Fondo de alta volatilidad basado en cripto.'}
                >
                  <TouchableOpacity
                    style={[
                      styles.strategyOption,
                      strategy === key && styles.strategyOptionActive,
                    ]}
                    onPress={() => setStrategy(key)}
                  >
                    <Text
                      style={[
                        styles.strategyText,
                        strategy === key && styles.strategyTextActive,
                      ]}
                    >
                      {key === 'conservative'
                        ? 'Conservador'
                        : key === 'moderate'
                          ? 'Moderado'
                          : 'Agresivo'}
                    </Text>
                    <Text
                      style={[
                        styles.strategyApy,
                        strategy === key && styles.strategyTextActive,
                      ]}
                    >
                      {STRATEGIES[key].tna}% TNA
                    </Text>
                  </TouchableOpacity>
                </Tooltip>
              ))}
            </View>
          </View>

          <Tooltip label="Confirmar y procesar la inversión">
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Confirmar Inversión</Text>
            </TouchableOpacity>
          </Tooltip>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4,5,8,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'rgba(20,23,40,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 28,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  closeBtnText: {
    color: '#64748b',
    fontSize: 18,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySign: {
    fontSize: 22,
    fontWeight: '500',
    color: '#94a3b8',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
    paddingVertical: 14,
  },
  hint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  strategyPicker: {
    flexDirection: 'row',
    gap: 6,
  },
  strategyOption: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  strategyOptionActive: {
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderColor: 'rgba(99,102,241,0.3)',
  },
  strategyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  strategyTextActive: {
    color: '#f8fafc',
  },
  strategyApy: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  confirmBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmText: {
    color: '#1a1a2e',
    fontWeight: '600',
    fontSize: 14,
  },
});
