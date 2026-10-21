/** Supabase may emit SIGNED_IN repeatedly on tab refocus and TOKEN_REFRESHED. Revalidate server access without unmounting the verified lesson. New account or sign-out suspends the previous member UI. */
export function shouldSuspendMemberLayout(verifiedUserId: string | null, nextUserId: string | null): boolean {
  return !verifiedUserId || !nextUserId || verifiedUserId !== nextUserId;
}
