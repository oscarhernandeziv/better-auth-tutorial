"use server";

import { auth } from "@/src/auth";
import prisma from "@/src/db";
import TodoSchema from "@/src/helpers/zod/todo-schema";
import { headers } from "next/headers";
import type { z } from "zod";

export async function getTodos() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new Error("Unauthorized");
	}

	return prisma.todo.findMany({
		where: {
			userId: session.user.id,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function createTodo(data: z.infer<typeof TodoSchema>) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new Error("Unauthorized");
	}

	const validation = TodoSchema.safeParse(data);
	if (!validation.success) {
		throw new Error(validation.error.errors[0].message);
	}

	return prisma.todo.create({
		data: {
			title: validation.data.title,
			userId: session.user.id,
		},
	});
}

export async function updateTodo(id: string, completed: boolean) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new Error("Unauthorized");
	}

	const todo = await prisma.todo.findUnique({
		where: { id },
	});

	if (!todo || todo.userId !== session.user.id) {
		throw new Error("Todo not found");
	}

	return prisma.todo.update({
		where: { id },
		data: { completed },
	});
}

export async function deleteTodo(id: string) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new Error("Unauthorized");
	}

	const todo = await prisma.todo.findUnique({
		where: { id },
	});

	if (!todo || todo.userId !== session.user.id) {
		throw new Error("Todo not found");
	}

	return prisma.todo.delete({
		where: { id },
	});
}
