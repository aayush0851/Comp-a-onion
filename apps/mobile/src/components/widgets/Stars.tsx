import { Text, View } from 'react-native';
import { colors, font } from '../../theme';

export function ratingText(value: number): string {
  return value.toFixed(2).replace(/0$/, '');
}

export function Stars({
  value, size = 'm', showValue = true, count,
}: { value: number; size?: 's' | 'm' | 'l'; showValue?: boolean; count?: number }) {
  const fs = { s: 11, m: 14, l: 19 }[size];
  const tfs = { s: 11.5, m: 13, l: 16 }[size];
  const filled = Math.round(value);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Text key={i} style={{ fontSize: fs, lineHeight: fs + 2, color: i < filled ? colors.amber : colors.zinc200 }}>★</Text>
        ))}
      </View>
      {showValue && <Text style={{ fontFamily: font.bold, fontSize: tfs, letterSpacing: -0.2, color: colors.ink }}>{ratingText(value)}</Text>}
      {!!count && <Text style={{ fontFamily: font.medium, fontSize: 12, color: colors.zinc500 }}>{count} meetups</Text>}
    </View>
  );
}
