import { useMemo, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../theme';
import { Btn, Sheet } from './widgets';

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 3;
const PAD = ITEM_HEIGHT * Math.floor(VISIBLE_ROWS / 2);

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

function parseTime(time: string | null): [number, number, number] {
  const match = time?.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return [6, 0, 1]; // default 7:00 PM
  const hourIdx = HOURS.indexOf(String(Number(match[1])));
  const minuteIdx = MINUTES.indexOf(match[2]) === -1 ? 0 : MINUTES.indexOf(match[2]);
  const periodIdx = match[3].toUpperCase() === 'PM' ? 1 : 0;
  return [hourIdx === -1 ? 6 : hourIdx, minuteIdx, periodIdx];
}

function WheelColumn({ data, index, onChange }: { data: string[]; index: number; onChange: (i: number) => void }) {
  const snap = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    onChange(Math.max(0, Math.min(data.length - 1, i)));
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate='fast'
      contentContainerStyle={{ paddingVertical: PAD }}
      style={{ height: ITEM_HEIGHT * VISIBLE_ROWS }}
      contentOffset={{ x: 0, y: index * ITEM_HEIGHT }}
      onMomentumScrollEnd={snap}
    >
      {data.map((label, i) => (
        <View key={label} style={styles.wheelItem}>
          <Text style={i === index ? styles.wheelLabelActive : styles.wheelLabel}>{label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export default function TimeWheelSheet({
  visible, initialTime, onClose, onConfirm,
}: {
  visible: boolean;
  initialTime: string | null;
  onClose: () => void;
  onConfirm: (time: string) => void;
}) {
  const [hourIdx, minuteIdx, periodIdx] = useMemo(() => parseTime(initialTime), [visible, initialTime]);
  const [hour, setHour] = useState(hourIdx);
  const [minute, setMinute] = useState(minuteIdx);
  const [period, setPeriod] = useState(periodIdx);

  const confirm = () => onConfirm(`${HOURS[hour]}:${MINUTES[minute]} ${PERIODS[period]}`);

  return (
    <Sheet visible={visible} onClose={onClose} title='Pick a time' sub='Scroll each wheel to set the exact time.'>
      <View style={styles.wheelRow}>
        <View pointerEvents='none' style={styles.highlightBar} />
        <WheelColumn data={HOURS} index={hour} onChange={setHour} />
        <Text style={styles.colon}>:</Text>
        <WheelColumn data={MINUTES} index={minute} onChange={setMinute} />
        <WheelColumn data={PERIODS} index={period} onChange={setPeriod} />
      </View>
      <View style={{ marginTop: 22 }}>
        <Btn label='Set time' onPress={confirm} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  wheelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  highlightBar: { position: 'absolute', left: 0, right: 0, top: PAD, height: ITEM_HEIGHT, backgroundColor: colors.zinc100, borderRadius: 14 },
  colon: { fontFamily: font.extrabold, fontSize: 20, color: colors.ink, marginHorizontal: 2 },
  wheelItem: { height: ITEM_HEIGHT, width: 64, alignItems: 'center', justifyContent: 'center' },
  wheelLabel: { fontFamily: font.medium, fontSize: 16, color: colors.zinc400 },
  wheelLabelActive: { fontFamily: font.extrabold, fontSize: 19, color: colors.ink },
});
