"use client";

import ApplicationInfo from "@/components/application/applicationInfo";
import { JobApplication } from "@prisma/client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApplication } from "@/store/useApplication";

type Props = {};

export default function EditPage({}: Props) {
	const searchParams = useSearchParams();
	const applicationId = searchParams.get("id");
	const { applications } = useApplication();
	const [application, setApplication] = useState<JobApplication>();

	useEffect(() => {
		if (applicationId) {
			const application = applications.find(
				(application) => application.id === parseInt(applicationId),
			);
			setApplication(application);
		}
	}, [applications, applicationId]);

	return (
		<main className="mb-8 flex min-h-screen w-full flex-col items-center justify-center text-gray-800">
			<div className="flex w-full max-w-4xl flex-col items-center gap-6">
				{application && <ApplicationInfo application={application} />}
			</div>
		</main>
	);
}
