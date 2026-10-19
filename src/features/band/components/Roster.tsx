import { StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components';
import { spacing } from '@/theme';
import type { RosterMember } from '../types';

/**
 * Who is in the band.
 *
 * Mapped rather than virtualised: the FlashList rule exists for the repertoire
 * and setlists, where a list is hundreds of rows. A band is five people inside
 * a screen that already scrolls, and nesting a virtualised list inside it
 * would break the scroll rather than help it.
 *
 * Seeing the whole roster is also the cheap half of the invite-link threat
 * model: in a band where everyone knows each other, somebody who was never
 * invited is obvious at a glance.
 */
export function Roster({ members }: { members: RosterMember[] }) {
  return (
    <Card>
      <Text variant="heading">
        {members.length === 1 ? 'Just you so far' : `${members.length} in the band`}
      </Text>

      <View style={styles.list}>
        {members.map((member) => (
          <View key={member.userId} style={styles.row}>
            <Text>{member.displayName ?? 'Name not set yet'}</Text>

            <Text variant="caption" tone="muted">
              {[
                member.role === 'leader' ? 'Leader' : null,
                member.instruments.length ? member.instruments.join(', ') : null,
              ]
                .filter(Boolean)
                .join(' · ') || 'Member'}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  row: {
    gap: spacing.xs,
  },
});
