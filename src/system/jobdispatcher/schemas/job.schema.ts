import z from 'zod';
import { JobOptionsSchema } from './job-option.schema.js';
import { createMessageEnvelopeSchema } from '../../common/contracts/base-event.contract.js';
import type { IMessageEnvelope } from '../../common/contracts/base-event.contract.js';

// 1. Generic schema for a job descriptor with a specific payload type
export const createJobDescriptorSchema = <T extends z.ZodTypeAny>(
	payloadSchema: T,
) =>
	z.object({
		name: z.string().min(1, { message: 'Job name cannot be empty' }),
		data: createMessageEnvelopeSchema(payloadSchema),
		opts: JobOptionsSchema.optional(),
	});

// 2. Default schema (for cases where the payload is not yet specialized)
export const JobDescriptorSchema = createJobDescriptorSchema(z.unknown());

// 3. TypeScript type for a job descriptor with a specific payload type
export type IJobDescriptor<T = unknown> = {
	name: string;
	data: IMessageEnvelope<T>;
	opts?: z.infer<typeof JobOptionsSchema>;
};
