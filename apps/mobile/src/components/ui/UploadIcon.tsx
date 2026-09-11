import { View } from 'react-native';

export function UploadIcon({ size = 14, color = '#fff' }: { size?: number; color?: string }) {
  const arrowWidth = size * 0.5;
  const stemWidth = size * 0.16;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 0, height: 0,
            borderLeftWidth: arrowWidth / 2, borderRightWidth: arrowWidth / 2, borderBottomWidth: arrowWidth * 0.65,
            borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color,
          }}
        />
        <View style={{ width: stemWidth, height: size * 0.32, backgroundColor: color }} />
      </View>
      <View style={{ width: size * 0.85, height: size * 0.14, backgroundColor: color, borderRadius: 1, marginTop: size * 0.12 }} />
    </View>
  );
}
