import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';
import { EmptyState, FilterChips, Header, ListRow, PlanCard, TabBar, TabKey } from '../components/widgets';
import { costModeLabel, formatDateKey, genderRestrictionLabel } from '../data';
import { isPlanArchived, planArchiveReason, useAppState } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'MyPlans'>;

const FILTERS = ['Upcoming', 'Archived'] as const;

export default function MyPlans({ navigation }: Props) {
  const state = useAppState();
  const [filter, setFilter] = useState<typeof FILTERS[number]>('Upcoming');
  const plans = state.publishedPlans.filter((p) => (filter === 'Archived' ? isPlanArchived(p) : !isPlanArchived(p)));

  const onTab = (key: TabKey) => {
    if (key === 'explore') navigation.navigate('Board');
    else if (key === 'chats') navigation.navigate('ChatList');
    else if (key === 'me') navigation.navigate('Profile');
  };

  return (
    <View style={styles.screen}>
      <Header
        variant="home"
        title="Your plans"
        subtitle="Everything you've posted, in one place."
        action="New plan"
        onAction={() => navigation.navigate('Create')}
      />
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <FilterChips
          items={[...FILTERS]}
          active={FILTERS.indexOf(filter)}
          onChange={(i) => setFilter(FILTERS[i])}
        />
      </View>

      {plans.length === 0 ? (
        <View style={{ paddingTop: 40 }}>
          <EmptyState
            shape="square"
            tone="peach"
            title={filter === 'Archived' ? 'Nothing archived' : 'Nothing posted yet'}
            body={filter === 'Archived'
              ? 'Plans land here once they wrap up or you archive them.'
              : "One line about what you're doing tonight is enough. It goes out to verified people nearby."}
            cta={filter === 'Archived' ? undefined : 'Post a plan'}
            onPressCta={() => navigation.navigate('Create')}
          />
        </View>
      ) : filter === 'Upcoming' ? (
        <ScrollView contentContainerStyle={styles.cards}>
          {plans.map((p) => {
            const when = p.date ? `${formatDateKey(p.date)}${p.time ? ` · ${p.time}` : ''}` : p.time ?? 'No time set';
            const pending = p.approvalRequired ? p.requesters.filter((r) => !p.decided[r.id]).length : 0;
            const joined = p.approvalRequired ? Object.values(p.decided).filter((d) => d === 'in').length : p.requesters.length;
            const shapeLabel = p.shape === 'duo' ? 'Just me + one' : genderRestrictionLabel(p.genderRestriction);
            return (
              <PlanCard
                key={p.id}
                compact
                title={p.title}
                blurb={[p.venue, when].filter(Boolean).join(' · ')}
                venue={`YOUR PLAN${p.venue ? ` · ${p.venue.toUpperCase()}` : ''}`}
                time={p.time ?? 'Any'}
                dist={when}
                badge={pending > 0 ? `${pending} asking` : p.approvalRequired ? 'You approve' : 'Open seats'}
                badgeTone={pending > 0 ? 'primary' : p.approvalRequired ? 'light' : 'sage'}
                tag={costModeLabel(p.costMode)}
                kind={shapeLabel}
                filled={joined}
                total={p.approvalRequired ? p.requesters.length || 1 : Math.max(joined, 1)}
                cta={pending > 0 ? `Review ${pending} request${pending === 1 ? '' : 's'}` : 'Manage plan'}
                ctaVariant={pending > 0 ? 'dark' : 'secondary'}
                host="You"
                hostInitials="YO"
                onPress={() => navigation.navigate('PlanManage', { id: p.id })}
                onPressCta={() => navigation.navigate('PlanManage', { id: p.id })}
              />
            );
          })}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {plans.map((p) => {
            const when = p.date ? `${formatDateKey(p.date)}${p.time ? ` · ${p.time}` : ''}` : p.time ?? 'No time set';
            const joined = p.approvalRequired ? Object.values(p.decided).filter((d) => d === 'in').length : p.requesters.length;
            return (
              <ListRow
                key={p.id}
                title={p.title}
                meta={[when, p.venue ?? undefined].filter(Boolean).join(' · ')}
                initials={String(joined)}
                tone="sage"
                chevron
                right={planArchiveReason(p)}
                onPress={() => navigation.navigate('PlanManage', { id: p.id })}
              />
            );
          })}
        </ScrollView>
      )}

      <View style={styles.tabBar}>
        <TabBar active="plans" unread={false} onPress={onTab} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  cards: { paddingHorizontal: 16, paddingBottom: 100, gap: 14 },
  list: { paddingHorizontal: 20, paddingBottom: 100, gap: 10 },
  tabBar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
