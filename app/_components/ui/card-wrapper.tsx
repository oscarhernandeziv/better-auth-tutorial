import Link from "next/link";
import type React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./card";

interface CardWrapperType {
	children: React.ReactNode;
	cardTitle: string;
	cardDescription: string;
	cardFooterLinkTitle?: string;
	cardFooterDescription?: string;
	cardFooterLink?: string;
	className?: string;
}

const CardWrapper = ({
	children,
	cardTitle,
	cardDescription,
	cardFooterLinkTitle = "Learn More",
	cardFooterDescription = "",
	cardFooterLink,
	className = "",
}: CardWrapperType) => {
	return (
		<Card className={`relative w-[400px] ${className}`}>
			<CardHeader>
				<CardTitle>{cardTitle}</CardTitle>
				<CardDescription>{cardDescription}</CardDescription>
			</CardHeader>
			<CardContent>{children}</CardContent>
			{cardFooterLink && (
				<CardFooter className="flex items-center justify-center gap-x-1">
					{cardFooterDescription && <span>{cardFooterDescription}</span>}
					<Link href={cardFooterLink} className="underline hover:text-gray-500">
						{cardFooterLinkTitle}
					</Link>
				</CardFooter>
			)}
		</Card>
	);
};

export default CardWrapper;
