// src/system/eventbus/contracts/base-event.contract.ts
import { z } from 'zod';

export const createMessageEnvelopeSchema = <T extends z.ZodTypeAny>(
	dataSchema: T,
) =>
	z.object({
		id: z.uuidv7(),
		pattern: z.string().min(1),
		timestamp: z.iso.datetime(),
		version: z.string().default('1.0.0'),
		requestId: z.string().min(1),
		data: dataSchema,
	});

export type IMessageEnvelope<T = unknown> = {
	id: string;
	pattern: string;
	timestamp: string;
	version: string;
	requestId: string;
	data: T;
};
