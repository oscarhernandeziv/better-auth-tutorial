import { z } from "zod";

export const ForgotPasswordSchema = z.object({
	email: z
		.string()
		.email({ message: "Invalid type" })
		.min(1, { message: "Email is required" }),
});
