import z from 'zod';
import { JobOptionsSchema } from './job-option.schema.js';

export const BulkJobSchema = z.object({
	jobName: z.string().min(1, { message: 'Job name cannot be empty' }),
	payload: z.unknown(),
	options: JobOptionsSchema.optional(),
});

export type IBulkJob = z.infer<typeof BulkJobSchema>;
