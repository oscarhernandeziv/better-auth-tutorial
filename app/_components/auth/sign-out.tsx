"use client";
import { signOut } from "@/src/auth/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

const SignOut = () => {
	const router = useRouter();
	return (
		<Button
			variant={"outline"}
			onClick={async () => {
				try {
					await signOut();
					router.push("/");
					router.refresh();
				} catch (error) {
					console.error("Error during sign out:", error);
				}
			}}
		>
			Sign Out
		</Button>
	);
};

export default SignOut;
