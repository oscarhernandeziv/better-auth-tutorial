"use client";
import { authClient, useSession } from "@/src/auth/auth-client";
import ProfileUpdateSchema from "@/src/helpers/zod/profile-update-schema";
import { PasswordSchema } from "@/src/helpers/zod/sign-up-schema";
import { useAuthState } from "@/src/hooks/useAuthState";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Mail, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import FormError from "../forms/form-error";
import FormSuccess from "../forms/form-success";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
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
	const [profileOpen, setProfileOpen] = useState<boolean>(false);
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

	const profileForm = useForm<z.infer<typeof ProfileUpdateSchema>>({
		resolver: zodResolver(ProfileUpdateSchema),
		defaultValues: {
			name: data?.user.name || "",
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

	const onProfileSubmit = async (
		values: z.infer<typeof ProfileUpdateSchema>,
	) => {
		resetState();
		setLoading(true);

		try {
			// Update user profile
			await authClient.updateUser(
				{
					name: values.name,
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
						setSuccess("Profile updated successfully");
						setTimeout(() => {
							setProfileOpen(false);
							resetState();
						}, 1000);
					},
					onError: (ctx) => {
						setError(ctx.error.message);
					},
				},
			);
		} catch (error) {
			console.error(error);
			setError("Something went wrong");
			setLoading(false);
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

			<Dialog
				open={profileOpen}
				onOpenChange={() => {
					setProfileOpen(false);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Update Profile</DialogTitle>
						<DialogDescription>
							Update your profile information
						</DialogDescription>
						<Form {...profileForm}>
							<form
								onSubmit={profileForm.handleSubmit(onProfileSubmit)}
								className="space-y-4"
							>
								<FormField
									control={profileForm.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name</FormLabel>
											<FormControl>
												<Input disabled={loading} type="text" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="space-y-2">
									<FormLabel>Email</FormLabel>
									<Input
										value={data?.user.email || ""}
										disabled={true}
										type="email"
										className="bg-muted"
									/>
								</div>
								<FormField
									control={profileForm.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Password (to confirm changes)</FormLabel>
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
									Update Profile
								</Button>
							</form>
						</Form>
					</DialogHeader>
				</DialogContent>
			</Dialog>

			{data?.session && (
				<Dialog>
					<DialogTrigger asChild>
						<Button variant={"outline"}>Settings</Button>
					</DialogTrigger>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Settings</DialogTitle>
							<DialogDescription>
								Make changes in your settings here
							</DialogDescription>
						</DialogHeader>

						{/* Profile Information Card */}
						<Card>
							<CardHeader className="p-4">
								<CardTitle className="text-sm">Profile Information</CardTitle>
								<CardDescription className="text-xs">
									View and update your profile information
								</CardDescription>
							</CardHeader>
							<CardContent className="p-4 pt-0">
								<div className="flex flex-col space-y-2">
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-2">
											<User className="h-4 w-4 text-muted-foreground" />
											<span className="font-medium text-sm">Name:</span>
										</div>
										<span className="text-sm">{data?.user.name}</span>
									</div>
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-2">
											<Mail className="h-4 w-4 text-muted-foreground" />
											<span className="font-medium text-sm">Email:</span>
										</div>
										<span className="text-sm">{data?.user.email}</span>
									</div>
									<Button
										variant="outline"
										size="sm"
										className="mt-2"
										onClick={() => {
											profileForm.reset({
												name: data?.user.name || "",
												password: "",
											});
											setProfileOpen(true);
										}}
									>
										<Edit className="mr-2 h-4 w-4" />
										Edit Profile
									</Button>
								</div>
							</CardContent>
						</Card>

						{/* Two Factor Authentication Card */}
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
