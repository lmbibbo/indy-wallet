import { useRef, useCallback } from 'react';
import { View, PanResponder, StyleSheet, LayoutChangeEvent } from 'react-native';

interface Props {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

export default function Slider({ min, max, value, onChange }: Props) {
  const widthRef = useRef(1);
  const thumbSize = 24;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
  }, []);

  const fraction = (value - min) / (max - min);
  const left = fraction * (widthRef.current - thumbSize);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const frac = Math.max(0, Math.min(1, x / (widthRef.current || 1)));
        const val = Math.round(min + frac * (max - min));
        onChange(val);
      },
      onPanResponderMove: (_, gestureState) => {
        const totalWidth = widthRef.current || 1;
        const x = gestureState.moveX - (gestureState.x0 - gestureState.moveX + gestureState.vx * 0);
        const frac = Math.max(0, Math.min(1, x / totalWidth));
        const val = Math.round(min + frac * (max - min));
        onChange(val);
      },
    })
  ).current;

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <View
      style={styles.track}
      onLayout={onLayout}
      {...panResponder.panHandlers}
    >
      <View style={[styles.fill, { width: `${pct}%` }]} />
      <View style={[styles.thumb, { left: `${pct}%`, marginLeft: -thumbSize / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    position: 'relative',
    justifyContent: 'center',
  },
  fill: {
    height: 6,
    backgroundColor: '#5f5ef3',
    borderRadius: 10,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5f5ef3',
    position: 'absolute',
    top: -9,
    shadowColor: '#5f5ef3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
});
