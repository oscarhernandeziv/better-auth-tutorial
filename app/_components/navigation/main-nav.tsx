"use client";

import { useSession } from "@/src/auth/auth-client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Settings from "../auth/settings";
import SignOut from "../auth/sign-out";
import { ThemeToggle } from "../themes/theme-toggle";
import { Button } from "../ui/button";

export function MainNav() {
	const { data: session } = useSession();
	const pathname = usePathname();

	return (
		<nav className="fixed top-0 left-0 z-10 w-full border-b">
			<div className="container mx-auto flex h-16 items-center px-4">
				<div className="mr-4 hidden md:flex">
					<Link href="/" className="mr-6 flex items-center space-x-2">
						<span className="hidden font-bold sm:inline-block">
							Better Auth Tutorial
						</span>
					</Link>
					<nav className="flex items-center space-x-6 font-medium text-sm">
						<Link
							href="/"
							className={`transition-colors hover:text-foreground/80 ${
								pathname === "/" ? "text-foreground" : "text-foreground/60"
							}`}
						>
							Home
						</Link>
						{session && (
							<Link
								href="/dashboard"
								className={`transition-colors hover:text-foreground/80 ${
									pathname === "/dashboard"
										? "text-foreground"
										: "text-foreground/60"
								}`}
							>
								Dashboard
							</Link>
						)}
					</nav>
				</div>
				<div className="flex flex-1 items-center justify-end space-x-4">
					<nav className="flex items-center space-x-2">
						{session ? (
							<>
								<span className="text-foreground/60 text-sm">
									{session.user.name}
								</span>
								<Settings />
								<SignOut />
							</>
						) : (
							<>
								<Button variant="outline" size="sm" asChild>
									<Link href="/sign-in">Sign In</Link>
								</Button>
								<Button variant="outline" size="sm" asChild>
									<Link href="/sign-up">Sign Up</Link>
								</Button>
							</>
						)}
						<ThemeToggle />
					</nav>
				</div>
			</div>
		</nav>
	);
}
