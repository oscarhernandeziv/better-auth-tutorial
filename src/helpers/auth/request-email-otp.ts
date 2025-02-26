import { authClient } from "@/src/auth/auth-client";

interface EmailOTPResponse {
	data?: { success: boolean } | null;
	error?: { message: string };
}

export const requestEmailOTP = async (
	email: string,
): Promise<EmailOTPResponse> => {
	try {
		const response = await authClient.emailOtp.sendVerificationOtp({
			email,
			type: "sign-in",
		});

		return {
			data: response.data,
		};
	} catch (error: unknown) {
		console.error("Error requesting Email OTP:", error);
		return {
			error: { message: "Failed to request Email OTP. Please try again." },
		};
	}
};

export const signInWithEmailOTP = async (
	email: string,
	otp: string,
): Promise<EmailOTPResponse> => {
	try {
		await authClient.signIn.emailOtp({
			email,
			otp,
		});

		return {
			data: { success: true },
		};
	} catch (error: unknown) {
		console.error("Error signing in with Email OTP:", error);
		return {
			error: { message: "Failed to sign in with Email OTP. Please try again." },
		};
	}
};
