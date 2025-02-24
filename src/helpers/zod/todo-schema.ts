import { z } from "zod";

const TodoSchema = z.object({
	title: z.string().min(1, "Title is required").max(100, "Title is too long"),
});

export default TodoSchema;
