"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { authClient } from "@/src/auth/auth-client";
import { requestOTP } from "@/src/helpers/auth/request-otp";
import { TwoFactorSchema } from "@/src/helpers/zod/two-factor-schema";
import { useAuthState } from "@/src/hooks/useAuthState";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import FormError from "../forms/form-error";
import FormSuccess from "../forms/form-success";
import { Button } from "../ui/button";
import CardWrapper from "../ui/card-wrapper";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

const TwoFactor: React.FC = () => {
	const router = useRouter();
	const {
		error,
		success,
		loading,
		setSuccess,
		setError,
		setLoading,
		resetState,
	} = useAuthState();

	const form = useForm<z.infer<typeof TwoFactorSchema>>({
		mode: "onBlur",
		resolver: zodResolver(TwoFactorSchema),
		defaultValues: { code: "" },
	});

	// Function to request a new OTP
	const handleResendOTP = async () => {
		resetState();
		setLoading(true);

		try {
			const response = await requestOTP();

			if (response?.data) {
				setSuccess("OTP has been sent to your email.");
			} else if (response?.error) {
				setError(response.error.message);
			}
		} catch (err) {
			console.error("Error requesting OTP:", err);
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Function to verify the submitted OTP
	const handleSubmit = async (values: z.infer<typeof TwoFactorSchema>) => {
		resetState();
		setLoading(true);

		try {
			await authClient.twoFactor.verifyOtp(
				{ code: values.code },
				{
					onRequest: () => setLoading(true),
					onResponse: () => setLoading(false),
					onSuccess: () => {
						setSuccess("OTP validated successfully.");
						router.replace("/");
					},
					onError: (ctx) => setError(ctx.error.message),
				},
			);
		} catch (err) {
			console.error("Error verifying OTP:", err);
			setError("Unable to verify OTP. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<CardWrapper
			cardTitle="Two-Factor Authentication"
			cardDescription="Verify your identity with a one-time password."
			cardFooterDescription="Entered the wrong email?"
			cardFooterLink="/login"
			cardFooterLinkTitle="Login"
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)}>
					<FormField
						control={form.control}
						name="code"
						render={({ field }) => (
							<FormItem>
								<FormLabel>One-Time Password</FormLabel>
								<InputOTP
									maxLength={6}
									pattern={REGEXP_ONLY_DIGITS}
									{...field}
									disabled={loading}
								>
									<InputOTPGroup>
										{[
											"first",
											"second",
											"third",
											"fourth",
											"fifth",
											"sixth",
										].map((id, index) => (
											<InputOTPSlot key={id} index={index} />
										))}
									</InputOTPGroup>
								</InputOTP>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button
						onClick={handleResendOTP}
						variant="link"
						className="ml-60 text-xs underline"
						disabled={loading}
					>
						Resend OTP
					</Button>
					<FormError message={error} />
					<FormSuccess message={success} />
					<Button type="submit" disabled={loading} className="mt-4 w-full">
						Verify
					</Button>
				</form>
			</Form>
		</CardWrapper>
	);
};

export default TwoFactor;
