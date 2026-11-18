import z from 'zod';

export const JobOptionsSchema = z.object({
	priority: z.number().optional(), // Job priority
	delay: z.number().optional(), // Delay before execution (in ms)
	attempts: z.number().optional(), // Number of attempts in case of failure
	backoff: z // Retry strategy
		.object({
			type: z.enum(['fixed', 'exponential']),
			delay: z.number(),
		})
		.optional(),
	version: z.string().optional(), // Version of the message schema
	jobId: z.string().optional(), // To force a specific ID and avoid duplicates
});

export type IJobOptions = z.infer<typeof JobOptionsSchema>;
