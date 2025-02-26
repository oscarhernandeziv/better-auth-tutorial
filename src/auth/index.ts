import prisma from "@/src/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { anonymous } from "better-auth/plugins/anonymous";
import { emailOTP } from "better-auth/plugins/email-otp";
import { magicLink } from "better-auth/plugins/magic-link";
import { twoFactor } from "better-auth/plugins/two-factor";
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
	plugins: [
		twoFactor({
			otpOptions: {
				async sendOTP({ user, otp }) {
					await resend.emails.send({
						from: "Acme <onboarding@resend.dev>",
						to: user.email,
						subject: "Two Factor Authentication",
						html: `Your OTP Code is ${otp}`,
					});
				},
			},
			skipVerificationOnEnable: true,
		}),
		anonymous({
			emailDomainName: "example.com",
		}),
		magicLink({
			disableSignUp: true, // Disable using magic link at signup
			sendMagicLink: async ({ email, url }) => {
				await resend.emails.send({
					from: "Acme <onboarding@resend.dev>",
					to: email,
					subject: "Magic Link",
					html: `Click the link to sign in into your account: ${url}`,
				});
			},
		}),
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				if (type === "sign-in") {
					await resend.emails.send({
						from: "Acme <onboarding@resend.dev>",
						to: email,
						subject: "Sign In OTP",
						html: `Your OTP Code is ${otp}`,
					});
				} else if (type === "email-verification") {
					await resend.emails.send({
						from: "Acme <onboarding@resend.dev>",
						to: email,
						subject: "Email Verification OTP",
						html: `Your OTP Code is ${otp}`,
					});
				} else {
					await resend.emails.send({
						from: "Acme <onboarding@resend.dev>",
						to: email,
						subject: "Password Reset OTP",
						html: `Your OTP Code is ${otp}`,
					});
				}
			},
		}),
	],
});
