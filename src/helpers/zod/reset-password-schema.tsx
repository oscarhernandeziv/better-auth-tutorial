import { z } from "zod";

export const ResetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, { message: "Password must be at least 8 characters long" })
			.max(24, { message: "Password must be at most 24 characters long" }),
		confirmPassword: z
			.string()
			.min(8, { message: "Password must be at least 8 characters long" })
			.max(24, { message: "Password must be at most 24 characters long" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});
