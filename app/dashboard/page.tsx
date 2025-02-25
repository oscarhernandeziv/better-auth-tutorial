import { auth } from "@/src/auth";
import { headers } from "next/headers";
import TodoList from "../_components/todos/todo-list";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return (
		<div className="flex h-screen w-full flex-col items-center justify-center px-4">
			<div className="flex w-full max-w-2xl flex-col gap-6">
				<div className="flex flex-col gap-2">
					<h1 className="font-bold text-3xl">Todo List</h1>
					<p className="text-muted-foreground">
						Welcome back, {session?.user?.name}!
					</p>
				</div>
				<TodoList />
			</div>
		</div>
	);
}
