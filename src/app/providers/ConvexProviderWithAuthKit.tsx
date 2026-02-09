import { ConvexProviderWithAuth } from "convex/react";
import { useAuth } from "@workos-inc/authkit-react";
import type { ConvexReactClient } from "convex/react";
import { useCallback, useMemo, type ReactNode } from "react";

type FetchTokenArgs = {
  forceRefreshToken: boolean;
};

function useConvexAuthFromWorkOS() {
  const { isLoading, user, getAccessToken } = useAuth();

  const fetchAccessToken = useCallback(async ({ forceRefreshToken }: FetchTokenArgs = { forceRefreshToken: false }) => {
    try {
      const token = await getAccessToken({ forceRefresh: forceRefreshToken });
      return token;
    } catch {
      return null;
    }
  }, [getAccessToken]);

  return useMemo(
    () => ({
      isLoading,
      isAuthenticated: !!user,
      fetchAccessToken,
    }),
    [isLoading, user, fetchAccessToken],
  );
}

export function ConvexProviderWithAuthKit({
  children,
  client,
}: {
  children: ReactNode;
  client: ConvexReactClient;
}) {
  const convexAuth = useConvexAuthFromWorkOS;
  return (
    <ConvexProviderWithAuth client={client} useAuth={convexAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}
