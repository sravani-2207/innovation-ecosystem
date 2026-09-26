import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";

/**
 * Central auth/session hook. `user` is the raw auth user; `role` is derived
 * from the member profile (the authoritative place roles are stored) and
 * `profile` exposes the full record for pages that need it.
 */
export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const current = useQuery(
    api.profiles.getCurrentProfile,
    isAuthenticated ? {} : "skip",
  );
  const { signIn, signOut } = useAuthActions();

  // Derive isLoading directly from the dependencies instead of managing separate state
  const isLoading = isAuthLoading || user === undefined;
  const profile = current?.profile ?? null;
  const role = profile?.role ?? user?.role ?? undefined;

  return {
    isLoading,
    isAuthenticated,
    user,
    profile,
    role,
    signIn,
    signOut,
  };
}
