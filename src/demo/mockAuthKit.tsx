/**
 * Mock replacement for "@workos-inc/authkit-react" in demo mode.
 * Vite aliases this module when VITE_DEMO_MODE=true.
 */
import { type ReactNode } from "react";
import { DEMO_VIEWER } from "./demoData";

// Mock WorkOS user object
const mockUser = {
  id: DEMO_VIEWER.workosUserId,
  email: DEMO_VIEWER.email,
  firstName: DEMO_VIEWER.name.split(" ")[0],
  lastName: DEMO_VIEWER.name.split(" ")[1] ?? "",
  profilePictureUrl: DEMO_VIEWER.avatarUrl,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  emailVerified: true,
};

export function useAuth() {
  return {
    isLoading: false,
    user: mockUser,
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
    getAccessToken: async () => "demo-token",
    authenticationMethod: "GoogleOAuth" as const,
  };
}

export function AuthKitProvider({
  children,
}: {
  children: ReactNode;
  clientId?: string;
  apiHostname?: string;
  redirectUri?: string;
  devMode?: boolean;
  onRedirectCallback?: (params: { state?: { returnTo?: string } }) => void;
}) {
  return <>{children}</>;
}
