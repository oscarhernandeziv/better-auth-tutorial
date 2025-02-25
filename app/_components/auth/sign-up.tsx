"use client";
import { signUp } from "@/src/auth/auth-client";
import SignupSchema from "@/src/helpers/zod/sign-up-schema";
import { useAuthState } from "@/src/hooks/useAuthState";
import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter } from "next/navigation";
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
import AnonymousButton from "./anonymous-button";

export default function SignUp() {
	// const router = useRouter();
	const {
		error,
		success,
		loading,
		setLoading,
		setError,
		setSuccess,
		resetState,
	} = useAuthState();

	const form = useForm<z.infer<typeof SignupSchema>>({
		resolver: zodResolver(SignupSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	const onSubmit = async (values: z.infer<typeof SignupSchema>) => {
		try {
			await signUp.email(
				{
					name: values.name,
					email: values.email,
					password: values.password,
					callbackURL: "/",
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
						// setSuccess("User has been created");
						// router.replace("/");
						setSuccess("Verification link has been sent to your email");
					},
					onError: (ctx) => {
						setError(ctx.error.message);
					},
				},
			);
		} catch (error) {
			console.error(error);
			setError("Something went wrong");
		}
	};

	return (
		<CardWrapper
			cardTitle="Sign Up"
			cardDescription="Create an new account"
			cardFooterDescription="Already have an account?"
			cardFooterLink="/sign-in"
			cardFooterLinkTitle="Sign in"
		>
			<Form {...form}>
				<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input
										disabled={loading}
										type="text"
										placeholder="john"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										disabled={loading}
										type="email"
										placeholder="example@gmail.com"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
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
					<FormError message={error} />
					<FormSuccess message={success} />
					<Button disabled={loading} type="submit" className="w-full">
						Submit
					</Button>
					<AnonymousButton />
				</form>
			</Form>
		</CardWrapper>
	);
}
