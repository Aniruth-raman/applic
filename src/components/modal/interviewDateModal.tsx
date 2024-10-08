"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { add, format, startOfDay, addDays, addMonths } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { useModal } from "@/store/useModal";
import { Checkbox } from "../ui/checkbox";
import { useState } from "react";
import { useApplication } from "@/store/useApplication";
import { Input } from "../ui/input";

const FormSchema = z.object({
	InterviewDate: z.date({
		message: "Interview date is required",
	}),
	InterviewTime: z.string({
		message: "Interview time is required",
	}),
	sendEmail: z.boolean().default(false).optional(),
});

const dates: {
	[key: string]: (date: Date) => Date;
} = {
	tomorrow: (date: Date) => addDays(startOfDay(date), 1),
	"day-after": (date: Date) => addDays(startOfDay(date), 2),
	"in-2-days": (date: Date) => addDays(startOfDay(date), 2),
	"in-3-days": (date: Date) => addDays(startOfDay(date), 3),
	"in-1-week": (date: Date) => add(date, { weeks: 1 }),
	"in-2-weeks": (date: Date) => add(date, { weeks: 2 }),
	"next-week": (date: Date) => add(date, { weeks: 1 }),
	"next-month": (date: Date) => add(date, { months: 1 }),
};

export default function InterviewDateModal() {
	const { type, onClose, isOpen, data } = useModal();
	const { setInterviewDate } = useApplication();
	const isModalOpen = isOpen && type === "set-interview-date";
	const [loading, setLoading] = useState(false);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			InterviewTime: "09:00",
		},
	});

	function updateDateFromOption(option: keyof typeof dates) {
		const dateToday = startOfDay(new Date());
		form.setValue("InterviewDate", dates[option](dateToday));
	}

	async function onSubmit(formData: z.infer<typeof FormSchema>) {
		setLoading(true);
		try {
			const InterviewDate = add(formData.InterviewDate, {
				hours: parseInt(formData.InterviewTime.split(":")[0]),
				minutes: parseInt(formData.InterviewTime.split(":")[1]),
			});

			data?.applicationId
				? await setInterviewDate(
						data.applicationId,
						InterviewDate,
						formData.sendEmail || false,
					)
				: toast.error("Application ID not found", {
						description: "Please close the modal and try again.",
					});
		} catch (error) {
			toast.error("Failed to set interview date");
			console.error("Failed to set interview date:", error);
		} finally {
			setLoading(false);
			onClose();
			form.reset();
		}
	}

	return (
		<Dialog
			open={isModalOpen}
			onOpenChange={() => {
				form.reset();
				onClose();
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Set Interview Date and Time</DialogTitle>
					<DialogDescription>
						Please select the date and time for the interview.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<div className="flex items-center gap-x-3">
							<FormField
								control={form.control}
								name="InterviewDate"
								render={({ field }) => (
									<FormItem className="flex grow flex-col">
										<FormLabel htmlFor="InterviewDate">
											Interview Date
										</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"flex justify-start gap-3 pl-3 text-left font-normal",
															!field.value &&
																"text-muted-foreground",
														)}
													>
														<CalendarIcon className="h-4 w-4 opacity-50" />
														{field.value ? (
															format(
																field.value,
																"PPP",
															)
														) : (
															<span>
																Pick a date
															</span>
														)}
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent
												className="w-auto p-0"
												align="start"
											>
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) =>
														date <
															new Date(
																new Date().getFullYear(),
																new Date().getMonth(),
																new Date().getDate(),
															) ||
														date >
															new Date(
																new Date().getFullYear() +
																	2,
																new Date().getMonth(),
																new Date().getDate(),
															)
													}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="InterviewTime"
								render={({ field }) => (
									<FormItem className="ml-0.5 flex flex-col">
										<FormLabel htmlFor="InterviewTime">
											Interview Time
											&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
										</FormLabel>
										<FormControl>
											<Input
												type="time"
												{...field}
												className="cursor-pointer"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="InterviewDate"
								render={() => (
									<FormItem className="ml-0.5 flex flex-col">
										<FormLabel htmlFor="Select Date">
											Quick Selection
											&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
										</FormLabel>
										<FormControl>
											<Select
												onValueChange={(value) => {
													updateDateFromOption(value);
												}}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select Date" />
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														{Object.keys(dates).map(
															(key) => (
																<SelectItem
																	key={key}
																	value={key}
																	className="cursor-pointer capitalize"
																>
																	{key
																		.replace(
																			/-/g,
																			" ",
																		)
																		.replace(
																			/day/g,
																			"day",
																		)
																		.replace(
																			/week/g,
																			"week",
																		)
																		.replace(
																			/month/g,
																			"month",
																		)}
																</SelectItem>
															),
														)}
													</SelectGroup>
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="sendEmail"
							render={({ field }) => (
								<FormItem className="ml-0.5 flex flex-col">
									<FormControl>
										<div className="flex items-center space-x-2">
											<Checkbox
												id="email"
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
											<label
												htmlFor="email"
												className="select-none text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											>
												Send reminder email a day before
												the interview.
											</label>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button type="submit" className="w-full">
								{loading ? "Submitting..." : "Submit"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
