import { StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../../theme';

export function StatTiles({ tiles, highlight = -1 }: { tiles: { value: string; label: string }[]; highlight?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 9 }}>
      {tiles.map((t, i) => {
        const hot = i === highlight;
        return (
          <View key={t.label} style={[styles.tile, { backgroundColor: hot ? colors.amber : colors.zinc100 }]}>
            <Text style={styles.value} numberOfLines={1}>{t.value}</Text>
            <Text style={[styles.label, { color: hot ? colors.amberInk : colors.zinc400 }]}>{t.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center' },
  value: { fontFamily: font.extrabold, fontSize: 17, letterSpacing: -0.5, color: colors.ink },
  label: { fontFamily: font.bold, fontSize: 9.5, letterSpacing: 0.9, textTransform: 'uppercase', marginTop: 5 },
});
