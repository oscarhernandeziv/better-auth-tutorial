"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type Control, useForm } from "react-hook-form";
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
import {
	requestEmailOTP,
	signInWithEmailOTP,
} from "@/src/helpers/auth/request-email-otp";
import { requestOTP } from "@/src/helpers/auth/request-otp";
// Import the schemas (adjusted to match likely export)
import {
	EmailOTPRequestSchema,
	EmailOTPSignInSchema,
	MagicLinkSignInSchema,
	TraditionalSignInSchema,
} from "@/src/helpers/zod/sign-in-schema";
import { KeyRound, Mail, WandSparkles } from "lucide-react";

export default function SignIn() {
	// State to manage the current sign-in method (traditional vs magic link)
	const [signInMethod, setSignInMethod] = useState<
		"traditional" | "magicLink" | "emailOTP"
	>("traditional");

	// State to track if OTP has been requested
	const [otpRequested, setOtpRequested] = useState(false);

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

	// Dynamically determine the current schema based on the selected sign-in method
	const getCurrentSchema = () => {
		if (signInMethod === "traditional") {
			return TraditionalSignInSchema;
		}
		if (signInMethod === "magicLink") {
			return MagicLinkSignInSchema;
		}
		if (signInMethod === "emailOTP") {
			return otpRequested ? EmailOTPSignInSchema : EmailOTPRequestSchema;
		}
		return TraditionalSignInSchema;
	};

	const currentSchema = getCurrentSchema();

	// Initialize form handling with the appropriate schema and default values
	const form = useForm<z.infer<typeof currentSchema>>({
		resolver: zodResolver(currentSchema),
		defaultValues: {
			email: "",
			...(signInMethod === "traditional" ? { password: "" } : {}),
			...(signInMethod === "emailOTP" && otpRequested ? { otp: "" } : {}),
		},
	});

	// Update form schema when OTP requested state changes
	useEffect(() => {
		if (signInMethod === "emailOTP") {
			const currentEmail = form.getValues().email;
			if (otpRequested) {
				form.reset({
					email: currentEmail,
					otp: "",
				} as z.infer<typeof EmailOTPSignInSchema>);
			} else {
				form.reset({
					email: currentEmail,
				} as z.infer<typeof EmailOTPRequestSchema>);
			}
		}
	}, [otpRequested, signInMethod, form]);

	// Handle sign-in method change
	const handleSignInMethodChange = (
		method: "traditional" | "magicLink" | "emailOTP",
	) => {
		const currentEmail = form.getValues().email;

		// Reset form with appropriate fields based on new sign-in method
		if (method === "traditional") {
			// Use type assertion with a specific type
			form.reset({
				email: currentEmail,
				password: "",
			} as z.infer<typeof TraditionalSignInSchema>);
		} else {
			form.reset({ email: currentEmail });
		}

		// Reset OTP requested state when changing away from emailOTP
		if (method !== "emailOTP") {
			setOtpRequested(false);
		}

		resetState();
		setSignInMethod(method);
	};

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
			} else if (signInMethod === "emailOTP") {
				// Handle email OTP sign-in
				if (!otpRequested) {
					// Request OTP
					const response = await requestEmailOTP(values.email);
					if (response?.data) {
						setOtpRequested(true);
						// Reset form with email and empty OTP field to avoid uncontrolled to controlled error
						form.reset({
							email: values.email,
							otp: "",
						} as z.infer<typeof EmailOTPSignInSchema>);
						setSuccess("OTP has been sent to your email.");
					} else if (response?.error) {
						setError(response.error.message);
					}
				} else {
					// Verify OTP and sign in
					const otpValues = values as z.infer<typeof EmailOTPSignInSchema>;
					const response = await signInWithEmailOTP(
						otpValues.email,
						otpValues.otp,
					);
					if (response?.data) {
						setSuccess("Logged in successfully.");
						router.replace("/");
					} else if (response?.error) {
						setError(response.error.message);
					}
				}
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
			cardDescription={
				signInMethod === "traditional"
					? "Sign in with your email and password."
					: signInMethod === "magicLink"
						? "Sign in with a secure link sent to your email."
						: "Sign in with a one-time password (OTP) sent to your email."
			}
			cardFooterDescription="Don't have an account?"
			cardFooterLink="/sign-up"
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
								onClick={() => handleSignInMethodChange("traditional")}
							>
								<Mail className="h-4 w-4" />
								Password
							</Button>
							<Button
								type="button"
								variant={signInMethod === "magicLink" ? "default" : "ghost"}
								className="rounded-md px-4"
								onClick={() => handleSignInMethodChange("magicLink")}
							>
								<WandSparkles className="h-4 w-4" />
								Magic Link
							</Button>
							<Button
								type="button"
								variant={signInMethod === "emailOTP" ? "default" : "ghost"}
								className="rounded-md px-4"
								onClick={() => handleSignInMethodChange("emailOTP")}
							>
								<KeyRound className="h-4 w-4" />
								Email OTP
							</Button>
						</div>
					</div>

					{/* Form Fields Container with Auto Height */}
					<div className="transition-all duration-300">
						{/* Email Field */}
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											disabled={
												loading || (signInMethod === "emailOTP" && otpRequested)
											}
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
								control={
									form.control as unknown as Control<
										z.infer<typeof TraditionalSignInSchema>
									>
								} // type assertion to tell TS that the control is valid for TraditionalSignInSchema
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

						{/* OTP Field (only for email OTP sign-in when OTP has been requested) */}
						<div
							className={`transition-all duration-300 ${
								signInMethod === "emailOTP" && otpRequested
									? "mt-4 max-h-[120px] opacity-100"
									: "max-h-0 overflow-hidden opacity-0"
							}`}
						>
							<FormField
								control={
									form.control as unknown as Control<
										z.infer<typeof EmailOTPSignInSchema>
									>
								} // type assertion to tell TS that the control is valid for EmailOTPSignInSchema
								name="otp"
								render={({ field }) => (
									<FormItem>
										<FormLabel>One-Time Password</FormLabel>
										<FormControl>
											<Input
												disabled={loading}
												type="text"
												placeholder="Enter OTP from your email"
												{...field}
											/>
										</FormControl>
										<FormMessage />
										<div className="flex justify-end">
											<Button
												type="button"
												variant="link"
												className="h-auto p-0 text-primary text-xs"
												onClick={async () => {
													const email = form.getValues().email;
													if (email) {
														setLoading(true);
														const response = await requestEmailOTP(email);
														setLoading(false);
														if (response?.data) {
															// Reset form with current email and empty OTP field
															form.reset({
																email: email,
																otp: "",
															} as z.infer<typeof EmailOTPSignInSchema>);
															setSuccess("OTP has been resent to your email.");
														} else if (response?.error) {
															setError(response.error.message);
														}
													} else {
														setError("Please enter your email address.");
													}
												}}
											>
												Resend OTP
											</Button>
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
							: signInMethod === "emailOTP" && !otpRequested
								? "Send OTP"
								: signInMethod === "emailOTP" && otpRequested
									? "Verify OTP & Sign In"
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
