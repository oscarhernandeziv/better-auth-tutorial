import { CheckCircle } from "lucide-react";

type FormSuccessProps = {
	message?: string;
};

const FormSuccess = ({ message }: FormSuccessProps) => {
	if (!message) return null;
	return (
		<div className="flex items-center gap-x-2 rounded-md bg-green-100 p-3 text-green-600 text-sm">
			<CheckCircle className="h-4 w-4" />
			{message}
		</div>
	);
};

export default FormSuccess;
