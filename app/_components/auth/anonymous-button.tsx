"use client";

import { authClient } from "@/src/auth/auth-client";
import { useAuthState } from "@/src/hooks/useAuthState";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function AnonymousButton() {
	const router = useRouter();
	// handler error, success, and loading state
	const { setSuccess, setError, setLoading, resetState } = useAuthState();
	const handleAnonymousSignIn = async () => {
		try {
			await authClient.signIn.anonymous({
				fetchOptions: {
					onSuccess: () => {
						setSuccess("Signed in anonymously");
						router.replace("/");
					},
					onError: (ctx) => setError(ctx.error.message),
					onRequest: () => {
						resetState();
						setLoading(true);
					},
					onResponse: () => setLoading(true),
				},
			});
		} catch (error) {
			console.log(error);
			setError("Something went wrong");
		}
	};
	return (
		<Button
			variant={"outline"}
			className="w-full"
			onClick={handleAnonymousSignIn}
		>
			<User />
			Guest
		</Button>
	);
}
