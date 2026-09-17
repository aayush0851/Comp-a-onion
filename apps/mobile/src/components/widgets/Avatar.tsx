import { Image, Text, View } from 'react-native';
import { font, ToneKey, tones } from '../../theme';

export function Avatar({
  initials, photo, size = 44, tone = 'amber', rounded, colorsOverride,
}: {
  initials: string;
  photo?: string | null;
  size?: number;
  tone?: ToneKey;
  rounded?: number;
  colorsOverride?: readonly [string, string];
}) {
  const [bg, fg] = colorsOverride ?? tones[tone];
  const r = rounded ?? size / 2;
  if (photo) return <Image source={{ uri: photo }} style={{ width: size, height: size, borderRadius: r, backgroundColor: bg }} />;
  return (
    <View style={{ width: size, height: size, minWidth: size, borderRadius: r, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: font.extrabold, fontSize: Math.round(size * 0.31), letterSpacing: -0.3, color: fg }}>{initials}</Text>
    </View>
  );
}
