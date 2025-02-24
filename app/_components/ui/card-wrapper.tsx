import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/app/_components/ui/card";
import type React from "react";

interface CardWrapperType {
	children: React.ReactNode;
	cardTitle: string;
	cardDescription: string;
}

const CardWrapper = ({
	children,
	cardTitle,
	cardDescription,
}: CardWrapperType) => {
	return (
		<Card className="relative w-[400px]">
			<CardHeader>
				<CardTitle>{cardTitle}</CardTitle>
				<CardDescription>{cardDescription}</CardDescription>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
};

export default CardWrapper;
