"use client";
import { authClient } from "@/src/auth/auth-client";
import { ResetPasswordSchema } from "@/src/helpers/zod/reset-password-schema";
import { useAuthState } from "@/src/hooks/useAuthState";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import FormError from "../forms/form-error";
import FormSuccess from "../forms/form-success";
import { Button } from "../ui/button";
import CardWrapper from "../ui/card-wrapper";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

export default function ResetPassword() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const {
		error,
		success,
		loading,
		setError,
		setLoading,
		setSuccess,
		resetState,
	} = useAuthState();

	const form = useForm<z.infer<typeof ResetPasswordSchema>>({
		resolver: zodResolver(ResetPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async (values: z.infer<typeof ResetPasswordSchema>) => {
		if (!token) {
			setError("Invalid or missing reset token");
			return;
		}

		try {
			await authClient.resetPassword(
				{
					newPassword: values.password,
					token: token,
				},
				{
					onResponse: () => {
						setLoading(false);
					},
					onRequest: () => {
						resetState();
						setLoading(true);
					},
					onSuccess: () => {
						setSuccess("New password has been created");
						router.replace("/sign-in");
					},
					onError: (ctx) => {
						setError(ctx.error.message);
					},
				},
			);
		} catch (error) {
			console.log(error);
			setError("Something went wrong");
		}
	};

	return (
		<CardWrapper
			cardTitle="Reset Password"
			cardDescription="Create a new password"
			cardFooterLink="/sign-in"
			cardFooterDescription="Remember your password?"
			cardFooterLinkTitle="Sign in"
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input
										disabled={loading}
										type="password"
										placeholder="************"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Confirm Password</FormLabel>
								<FormControl>
									<Input
										disabled={loading}
										type="password"
										placeholder="*************"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormError message={error} />
					<FormSuccess message={success} />
					<Button type="submit" className="w-full" disabled={loading}>
						Submit
					</Button>
				</form>
			</Form>
		</CardWrapper>
	);
}
