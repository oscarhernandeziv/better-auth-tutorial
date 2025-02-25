"use client";
import { authClient, signOut } from "@/src/auth/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

const SignOut = () => {
	const router = useRouter();
	const session = authClient.useSession();

	if (!session.data) {
		return (
			<Button
				onClick={() => {
					router.push("/sign-in");
				}}
			>
				Sign In
			</Button>
		);
	}

	return (
		<Button
			onClick={async () => {
				await signOut({
					fetchOptions: {
						onSuccess: () => {
							router.push("/sign-in");
						},
					},
				});
			}}
		>
			Sign Out
		</Button>
	);
};

export default SignOut;
