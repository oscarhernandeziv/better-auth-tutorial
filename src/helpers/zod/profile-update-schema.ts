import { z } from "zod";

export const ProfileUpdateSchema = z.object({
	name: z
		.string()
		.min(2, { message: "Name must be at least 2 characters long" })
		.max(30, { message: "Name must be at most 30 characters long" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters long" })
		.max(24, { message: "Password must be at most 24 characters long" }),
});

export default ProfileUpdateSchema;
