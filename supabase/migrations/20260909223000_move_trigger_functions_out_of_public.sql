-- Jamly — take the trigger functions out of the exposed API
--
-- Everything in `public` is a PostgREST endpoint. The three functions added by
-- 20260909220000_profiles.sql were therefore callable as
-- /rest/v1/rpc/handle_new_user by anyone holding the publishable key — and two
-- of them are SECURITY DEFINER, which is the shape of a privilege escalation
-- even when, as here, Postgres refuses to run a trigger function directly.
--
-- Flagged by `supabase db advisors` (lints 0028 and 0029). Fixed by moving them
-- somewhere PostgREST does not look, rather than by revoking execute one grant
-- at a time: a schema nobody is exposed to cannot be forgotten about later.
--
-- This is the pattern for every trigger function from here on. `set_updated_at`
-- in particular will be attached to every mutable table in the schema.

create schema if not exists private;

-- No grant to anon or authenticated, ever. A new schema grants nothing to
-- PUBLIC by default; this states it rather than relying on remembering it.
revoke all on schema private from public;

-- ALTER rather than drop and recreate: triggers reference a function by oid, so
-- they keep working and no window exists in which a profile could be missed.
alter function public.set_updated_at() set schema private;
alter function public.handle_new_user() set schema private;
alter function public.handle_user_email_change() set schema private;
