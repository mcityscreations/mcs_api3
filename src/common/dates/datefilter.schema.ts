import z from 'zod';

export const DateFilterSchema = z.object({
	startDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be in 'YYYY-MM-DD' format"),
	endDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be in 'YYYY-MM-DD' format"),
});

export type IDateFilter = z.infer<typeof DateFilterSchema>;
