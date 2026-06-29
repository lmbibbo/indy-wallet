import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface Props {
  label: string;
  children: React.ReactNode;
  style?: any;
}

export default function Tooltip({ label, children, style }: Props) {
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (Platform.OS !== 'web') return <>{children}</>;

  const handleIn = () => {
    if (timer.current) clearTimeout(timer.current);
    setShow(true);
  };

  const handleOut = () => {
    timer.current = setTimeout(() => setShow(false), 50);
  };

  const hoverProps = {
    onMouseEnter: handleIn,
    onMouseLeave: handleOut,
  };

  return (
    <View style={[styles.wrapper, style]} {...(hoverProps as any)}>
      {children}
      {show && (
        <View style={styles.bubble} pointerEvents="none">
          <View style={styles.bubbleInner}>
            <Text style={styles.label}>{label}</Text>
          </View>
          <View style={styles.arrow} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  bubble: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: [{ translateX: -50 }],
    marginBottom: 6,
    zIndex: 9999,
    alignItems: 'center',
  },
  bubbleInner: {
    backgroundColor: 'rgba(15, 18, 30, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(99, 102, 241, 0.4)',
    marginTop: -0.5,
  },
  label: {
    fontSize: 11,
    color: '#c7d2fe',
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 220,
  },
});
