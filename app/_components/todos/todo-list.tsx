"use client";

import { Button } from "@/app/_components/ui/button";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { Input } from "@/app/_components/ui/input";
import {
	createTodo,
	deleteTodo,
	getTodos,
	updateTodo,
} from "@/src/todos/actions";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const TodoSchema = z.object({
	title: z.string().min(1, "Title is required").max(100, "Title is too long"),
});

type Todo = {
	id: string;
	title: string;
	completed: boolean;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
};

export default function TodoList() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [error, setError] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);

	const form = useForm<z.infer<typeof TodoSchema>>({
		defaultValues: {
			title: "",
		},
	});

	const loadTodos = useCallback(async () => {
		try {
			const fetchedTodos = await getTodos();
			setTodos(fetchedTodos);
			setError("");
		} catch (err) {
			setError("Failed to load todos");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadTodos();
	}, [loadTodos]);

	const onSubmit = async (data: z.infer<typeof TodoSchema>) => {
		try {
			const newTodo = await createTodo(data);
			setTodos((prev) => [newTodo, ...prev]);
			form.reset();
			setError("");
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("Failed to create todo");
			}
			console.error(err);
		}
	};

	const handleToggle = async (id: string, completed: boolean) => {
		try {
			const updatedTodo = await updateTodo(id, completed);
			setTodos((prev) =>
				prev.map((todo) => (todo.id === id ? updatedTodo : todo)),
			);
			setError("");
		} catch (err) {
			setError("Failed to update todo");
			console.error(err);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteTodo(id);
			setTodos((prev) => prev.filter((todo) => todo.id !== id));
			setError("");
		} catch (err) {
			setError("Failed to delete todo");
			console.error(err);
		}
	};

	if (isLoading) {
		return <div className="text-center">Loading...</div>;
	}

	return (
		<div className="mx-auto w-full max-w-2xl space-y-4">
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex items-center gap-2"
			>
				<Input
					placeholder="Add a new todo..."
					{...form.register("title")}
					className="flex-1"
				/>
				<Button type="submit">Add Todo</Button>
			</form>

			{error && <div className="text-center text-red-500 text-sm">{error}</div>}

			{todos.length === 0 ? (
				<div className="text-center text-gray-500 dark:text-gray-400">
					No todos yet. Add one above!
				</div>
			) : (
				<div className="space-y-2">
					{todos.map((todo) => (
						<div
							key={todo.id}
							className="flex items-center gap-2 rounded-lg border bg-card p-2"
						>
							<Checkbox
								checked={todo.completed}
								onCheckedChange={(checked) =>
									handleToggle(todo.id, checked as boolean)
								}
							/>
							<span
								className={`flex-1 ${
									todo.completed ? "text-gray-500 line-through" : ""
								}`}
							>
								{todo.title}
							</span>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => handleDelete(todo.id)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
