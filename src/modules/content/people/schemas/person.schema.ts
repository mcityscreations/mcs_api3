import z from 'zod';
import { IndividualSchema } from './individual.schema.js';
import { OrganizationSchema } from './organization.schema.js';

export const PersonSchema = z.object({
	id: z.union([z.number(), z.uuid()]), // uuidv7
	type: z.enum(['individual', 'organization']),
	details: z.discriminatedUnion('type', [IndividualSchema, OrganizationSchema]),
});

export type IPerson = z.infer<typeof PersonSchema>;
