import { twoFactorClient } from "better-auth/client/plugins";
import { anonymousClient } from "better-auth/client/plugins";
import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_APP_URL,
	plugins: [twoFactorClient(), anonymousClient(), magicLinkClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
