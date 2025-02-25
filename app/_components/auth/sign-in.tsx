"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import FormError from "@/app/_components/forms/form-error";
import FormSuccess from "@/app/_components/forms/form-success";
import CardWrapper from "@/app/_components/ui/card-wrapper";

import SocialButton from "@/app/_components/auth/social-button";
import { signIn } from "@/src/auth/auth-client";
import { useAuthState } from "@/src/hooks/useAuthState";

import AnonymousButton from "@/app/_components/auth/anonymous-button";
import { Button } from "@/app/_components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";

import GitHubIcon from "@/app/_components/icons/GitHubIcon";
import GoogleIcon from "@/app/_components/icons/GoogleIcon";
import { requestOTP } from "@/src/helpers/auth/request-otp";
// Import the schemas (adjusted to match likely export)
import SignInSchema from "@/src/helpers/zod/sign-in-schema";
import { Mail, WandSparkles } from "lucide-react";

export default function SignIn() {
	// State to manage the current sign-in method (traditional vs magic link)
	const [signInMethod, setSignInMethod] = useState<"traditional" | "magicLink">(
		"traditional",
	);

	// Router instance for navigation
	const router = useRouter();

	// Authentication state hooks for managing feedback and loading state
	const {
		error,
		success,
		loading,
		setSuccess,
		setError,
		setLoading,
		resetState,
	} = useAuthState();

	// Extract schema options for traditional and magic link sign-in methods
	const TraditionalSignInSchema = SignInSchema.options[0];
	const MagicLinkSignInSchema = SignInSchema.options[1];

	// Dynamically determine the current schema based on the selected sign-in method
	const currentSchema =
		signInMethod === "traditional"
			? TraditionalSignInSchema
			: MagicLinkSignInSchema;

	// Initialize form handling with the appropriate schema and default values
	const form = useForm<z.infer<typeof currentSchema>>({
		resolver: zodResolver(currentSchema),
		defaultValues: {
			email: "",
			...(signInMethod === "traditional" ? { password: "" } : {}),
		},
	});

	// Form submission handler
	const onSubmit = async (values: z.infer<typeof currentSchema>) => {
		resetState(); // Reset any existing error or success messages
		setLoading(true); // Indicate that a request is in progress

		try {
			if (signInMethod === "magicLink") {
				// Handle magic link sign-in
				await signIn.magicLink(
					{ email: values.email },
					{
						onRequest: () => setLoading(true),
						onResponse: () => setLoading(false),
						onSuccess: () => {
							setSuccess("A magic link has been sent to your email.");
						},
						onError: (ctx) => {
							setError(ctx.error.message || "Failed to send magic link.");
						},
					},
				);
			} else {
				// Handle traditional sign-in
				const signInValues = values as z.infer<typeof TraditionalSignInSchema>;

				// Email-based login
				await signIn.email(
					{
						email: signInValues.email,
						password: signInValues.password,
					},
					{
						onRequest: () => setLoading(true),
						onResponse: () => setLoading(false),
						onSuccess: async (ctx) => {
							// Handle two-factor authentication if required
							if (ctx.data.twoFactorRedirect) {
								const response = await requestOTP();
								if (response?.data) {
									setSuccess("OTP has been sent to your email");
									router.push("/two-factor");
								} else if (response?.error) {
									setError(response.error.message);
								}
							} else {
								setSuccess("Logged in successfully.");
								router.replace("/");
							}
						},
						onError: (ctx) => {
							setError(
								ctx.error.message || "Email login failed. Please try again.",
							);
						},
					},
				);
			}
		} catch (err) {
			console.error(err);
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false); // Reset loading state
		}
	};

	return (
		<CardWrapper
			cardTitle="Sign In"
			cardDescription="Choose a sign-in method below."
			cardFooterDescription="Don't have an account?"
			cardFooterLink="/signup"
			cardFooterLinkTitle="Sign up"
		>
			<Form {...form}>
				<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
					{/* Sign-in Method Toggle */}
					<div className="mb-4 flex justify-center">
						<div className="flex rounded-lg bg-muted p-1">
							<Button
								type="button"
								variant={signInMethod === "traditional" ? "default" : "ghost"}
								className="rounded-md px-4"
								onClick={() => setSignInMethod("traditional")}
							>
								<Mail className="h-4 w-4" />
								Email / Password
							</Button>
							<Button
								type="button"
								variant={signInMethod === "magicLink" ? "default" : "ghost"}
								className="rounded-md px-4"
								onClick={() => setSignInMethod("magicLink")}
							>
								<WandSparkles className="h-4 w-4" />
								Magic Link
							</Button>
						</div>
					</div>

					{/* Form Fields Container with Auto Height */}
					<div className="overflow-hidden transition-all duration-300">
						{/* Email Field */}
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											disabled={loading}
											type="text"
											placeholder="email@example.com"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Password Field (only for traditional sign-in) */}
						<div
							className={`transition-all duration-300 ${
								signInMethod === "traditional"
									? "mt-4 max-h-[120px] opacity-100"
									: "max-h-0 overflow-hidden opacity-0"
							}`}
						>
							<FormField
								control={form.control}
								// @ts-ignore
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												disabled={loading}
												type="password"
												placeholder="********"
												{...field}
											/>
										</FormControl>
										<FormMessage />
										<div className="flex justify-end">
											<Link
												href="/forgot-password"
												className="text-primary text-xs hover:underline"
											>
												Forgot Password?
											</Link>
										</div>
									</FormItem>
								)}
							/>
						</div>
					</div>

					{/* Error & Success Messages */}
					<FormError message={error} />
					<FormSuccess message={success} />

					{/* Submit Button */}
					<Button disabled={loading} type="submit" className="w-full">
						{signInMethod === "magicLink"
							? "Send Magic Link"
							: "Sign In with Password"}
					</Button>

					{/* Guest Login Option */}
					<div className="mt-4">
						<AnonymousButton />
					</div>

					{/* Social Buttons */}
					<div className="mt-4 grid grid-cols-2 gap-2">
						<SocialButton
							provider="google"
							icon={<GoogleIcon />}
							label="Sign in with Google"
						/>
						<SocialButton
							provider="github"
							icon={<GitHubIcon />}
							label="Sign in with GitHub"
						/>
					</div>
				</form>
			</Form>
		</CardWrapper>
	);
}
