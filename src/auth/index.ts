import prisma from "@/src/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { resend } from "../helpers/emails/resend";

export const auth = betterAuth({
	appName: "better_auth_tutorial",
	database: prismaAdapter(prisma, { provider: "postgresql" }),
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
		},
		github: {
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/github`,
		},
	},
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		minPasswordLength: 8,
		maxPasswordLength: 24,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			await resend.emails.send({
				from: "Acme <onboarding@resend.dev>",
				to: user.email,
				subject: "Reset Password",
				html: `Click the link to reset your password: ${url}`,
			});
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await resend.emails.send({
				from: "Acme <onboarding@resend.dev>",
				to: user.email,
				subject: "Email Verification",
				html: `Click the link to verify your email: ${url}`,
			});
		},
	},
});
