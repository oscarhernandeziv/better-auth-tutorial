import { z } from "zod";

const TraditionalSignInSchema = z.object({
	email: z
		.string()
		.email({ message: "Invalid email" })
		.min(1, { message: "Email is required" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters long" })
		.max(24, { message: "Password must be less than 24 characters" }),
});

const MagicLinkSignInSchema = z.object({
	email: z
		.string()
		.email({ message: "Invalid email" })
		.min(1, { message: "Email is required" }),
});

const EmailOTPSignInSchema = z.object({
	email: z
		.string()
		.email({ message: "Invalid email" })
		.min(1, { message: "Email is required" }),
	otp: z
		.string()
		.min(1, { message: "OTP is required" })
		.max(8, { message: "OTP must be less than 8 characters" }),
});

const EmailOTPRequestSchema = z.object({
	email: z
		.string()
		.email({ message: "Invalid email" })
		.min(1, { message: "Email is required" }),
});

const SignInSchema = z.union([
	TraditionalSignInSchema,
	MagicLinkSignInSchema,
	EmailOTPSignInSchema,
	EmailOTPRequestSchema,
]);

export default SignInSchema;
export {
	TraditionalSignInSchema,
	MagicLinkSignInSchema,
	EmailOTPSignInSchema,
	EmailOTPRequestSchema,
};
