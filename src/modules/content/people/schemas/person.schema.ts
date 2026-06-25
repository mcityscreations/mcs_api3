import z from 'zod';
import { IndividualSchema } from './individual.schema.js';
import {
	OrganizationSchemaDB,
	OrganizationSchemaPublic,
} from './organization.schema.js';

const idPublic = z.uuidv7();
const idPrivate = z.number().int().positive();

export const PersonSchemaPrivate = z.object({
	id: idPrivate,
	details: z.discriminatedUnion('type', [
		IndividualSchema,
		OrganizationSchemaDB,
	]),
});

export const PersonSchemaPublic = z.object({
	id: idPublic,
	details: z.discriminatedUnion('type', [
		IndividualSchema,
		OrganizationSchemaPublic,
	]),
});

export type IPersonPrivate = z.infer<typeof PersonSchemaPrivate>;
export type IPersonPublic = z.infer<typeof PersonSchemaPublic>;
