"use client";
import { authClient, useSession } from "@/src/auth/auth-client";
import { PasswordSchema } from "@/src/helpers/zod/sign-up-schema";
import { useAuthState } from "@/src/hooks/useAuthState";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings as UserSettings } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import FormError from "../forms/form-error";
import FormSuccess from "../forms/form-success";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";

export default function Settings() {
	const { data } = useSession();
	const [open, setOpen] = useState<boolean>(false);
	const {
		error,
		success,
		loading,
		setLoading,
		setSuccess,
		setError,
		resetState,
	} = useAuthState();

	const form = useForm<z.infer<typeof PasswordSchema>>({
		resolver: zodResolver(PasswordSchema),
		defaultValues: {
			password: "",
		},
	});

	if (data?.user.twoFactorEnabled === null) {
		return;
	}

	const onSubmit = async (values: z.infer<typeof PasswordSchema>) => {
		if (data?.user.twoFactorEnabled === false) {
			await authClient.twoFactor.enable(
				{
					password: values.password,
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
						setSuccess("Enabled two-factor authentication");
						setTimeout(() => {
							setOpen(false);
							resetState();
							form.reset();
						}, 1000);
					},
					onError: (ctx) => {
						setError(ctx.error.message);
					},
				},
			);
		}
		if (data?.user.twoFactorEnabled === true) {
			await authClient.twoFactor.disable(
				{
					password: values.password,
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
						setSuccess("Disabled two-factor authentication");
						setTimeout(() => {
							setOpen(false);
							resetState();
							form.reset();
						}, 1000);
					},
					onError: (ctx) => {
						setError(ctx.error.message);
					},
				},
			);
		}
	};

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={() => {
					setOpen(false);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm selection</DialogTitle>
						<DialogDescription>
							Please enter your password to confirm selection
						</DialogDescription>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4"
							>
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
													placeholder="********"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormSuccess message={success} />
								<FormError message={error} />
								<Button
									type="submit"
									className="mt-4 w-full"
									disabled={loading}
								>
									Submit
								</Button>
							</form>
						</Form>
					</DialogHeader>
				</DialogContent>
			</Dialog>
			{data?.session && (
				<Dialog>
					<DialogTrigger asChild>
						<Button variant={"default"}>
							<UserSettings />
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Settings</DialogTitle>
							<DialogDescription>
								Make changes in your settings here
							</DialogDescription>
						</DialogHeader>
						<Card>
							<CardHeader className="flex flex-row justify-between p-4">
								<div>
									<CardTitle className="text-sm">Enable 2FA</CardTitle>
									<CardDescription className="text-xs">
										Select option to enable or disable two factor authentication
									</CardDescription>
								</div>
								<Switch
									checked={data?.user.twoFactorEnabled}
									onCheckedChange={() => {
										setOpen(true);
									}}
								/>
							</CardHeader>
						</Card>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
