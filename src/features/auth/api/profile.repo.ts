import { getSupabase, isBackendConfigured } from '@/lib/supabase';
import type { Profile } from '../types';

/**
 * The signed-in musician's own profile row.
 *
 * Lives in the auth slice while `me` does not exist yet; it moves there with
 * the first screen that edits it. Until then it earns its place by proving the
 * whole chain end to end: a session that reaches Postgres and comes back with
 * exactly one row is a session whose JWT row-level security accepted.
 */

/** The columns, snake_case, as they exist in supabase/migrations. */
const COLUMNS = 'id, email, display_name, avatar_url, plan';

type ProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: Profile['plan'];
};

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    plan: row.plan,
  };
}

export async function getMyProfile(userId: string): Promise<Profile | null> {
  if (!isBackendConfigured) return null;

  // Filtered by id as well as protected by the policy. The policy is the
  // security boundary; the filter is what makes the query say what it means.
  const { data, error } = await getSupabase()
    .from('profiles')
    .select(COLUMNS)
    .eq('id', userId)
    .maybeSingle<ProfileRow>();

  if (error) throw error;
  return data ? toProfile(data) : null;
}
