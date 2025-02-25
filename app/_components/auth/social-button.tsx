"use client";
import { signIn } from "@/src/auth/auth-client";
import { useAuthState } from "@/src/hooks/useAuthState";
import type React from "react";
import { Button } from "../ui/button";

interface SocialButtonProps {
	provider: "google" | "github";
	icon: React.ReactNode;
	label: string;
	callbackURL?: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({
	provider,
	icon,
	label,
	callbackURL = "/",
}) => {
	const { setError, setSuccess, loading, setLoading, resetState } =
		useAuthState();

	const handleSignIn = async () => {
		try {
			await signIn.social(
				{ provider, callbackURL },
				{
					onResponse: () => setLoading(false),
					onRequest: () => {
						resetState();
						setLoading(true);
					},
					onSuccess: () => {
						setSuccess("You are logged in successfully");
					},
					onError: (ctx) => setError(ctx.error.message),
				},
			);
		} catch (error: unknown) {
			console.error(error);
			setError("Something went wrong");
		}
	};

	return (
		<Button
			variant="default"
			onClick={handleSignIn}
			disabled={loading}
			className="flex w-full items-center justify-center"
		>
			<span className="flex items-center">{icon}</span>
			{label}
		</Button>
	);
};

export default SocialButton;
