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
import Tooltip from './Tooltip';

interface Props {
  visible: boolean;
  balance: number;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

export default function InvestModal({
  visible,
  balance,
  onClose,
  onConfirm,
}: Props) {
  const [amount, setAmount] = useState('');

  const handleConfirm = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || val > balance) return;
    onConfirm(val);
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
          <Tooltip label="Formulario para invertir en el Fondo Común">
            <Text style={styles.title}>Invertir en el Mercado</Text>
          </Tooltip>
          <Text style={styles.desc}>
            Transferí fondos al Fondo Común de Inversión. La estrategia de rendimiento
            es definida por el fondo, no por el usuario.
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
