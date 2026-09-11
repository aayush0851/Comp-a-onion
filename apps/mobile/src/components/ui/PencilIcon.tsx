import { View } from 'react-native';

export function PencilIcon({ size = 14, color = '#fff' }: { size?: number; color?: string }) {
  const barLength = size * 1.05;
  const barWidth = size * 0.24;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', transform: [{ rotate: '-45deg' }] }}>
        <View
          style={{
            width: 0, height: 0,
            borderTopWidth: barWidth / 2, borderBottomWidth: barWidth / 2, borderRightWidth: barWidth,
            borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: color,
          }}
        />
        <View style={{ width: barLength - barWidth, height: barWidth, backgroundColor: color, borderTopRightRadius: 1, borderBottomRightRadius: 1 }} />
      </View>
    </View>
  );
}
