import { Text, View } from 'react-native';
import { colors } from '../../theme';

export function Stars({
  value, size = 'm', showValue = true, count,
}: { value: number; size?: 's' | 'm' | 'l'; showValue?: boolean; count?: number }) {
  const fs = { s: 11, m: 14, l: 19 }[size];
  const tfs = { s: 11, m: 13, l: 16 }[size];
  const filled = Math.round(value);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Text key={i} style={{ fontSize: fs, lineHeight: fs + 2, color: i < filled ? colors.clay : '#E0D2C4' }}>★</Text>
        ))}
      </View>
      {showValue && <Text style={{ fontFamily: 'Figtree_700Bold', fontSize: tfs, letterSpacing: -0.2, color: colors.ink }}>{value.toFixed(1)}</Text>}
      {!!count && <Text style={{ fontFamily: 'Figtree_500Medium', fontSize: 12, color: colors.muted }}>({count})</Text>}
    </View>
  );
}
