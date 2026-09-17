import { View } from 'react-native';
import { colors } from '../../theme';

export function Steps({ total, current }: { total: number; current: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 5, width: '100%' }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 999, backgroundColor: i < current ? colors.ink : colors.zinc200 }} />
      ))}
    </View>
  );
}
