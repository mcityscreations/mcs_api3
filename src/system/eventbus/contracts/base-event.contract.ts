// src/system/eventbus/contracts/base-event.contract.ts
import { z } from 'zod';

export const MessageEnvelopeSchema = z.object({
	// Metadata
	id: z.uuidv7(), // Unique identifier for the message
	pattern: z.string(), // Event pattern or topic (ex: 'user.created')
	timestamp: z.string(), // ISO string of the event creation time
	version: z.string(), // Version of the event schema
	requestId: z.string(), // Correlation ID for tracing across services

	// Business data (Payload)
	data: z.unknown(),
});

export type IMessageEnvelope<T = unknown> = z.infer<
	typeof MessageEnvelopeSchema
> & {
	data: T;
};
