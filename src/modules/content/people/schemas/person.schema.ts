import z from 'zod';
import {
	IndividualSchema,
	CreateIndividualSchema,
} from './individual.schema.js';
import {
	OrganizationSchema,
	CreateOrganizationSchema,
} from './organization.schema.js';

export const PersonSchema = z.discriminatedUnion('type', [
	IndividualSchema,
	OrganizationSchema,
]);

export type IPerson = z.infer<typeof PersonSchema>;

export const CreatePersonSchema = z.discriminatedUnion('type', [
	CreateIndividualSchema,
	CreateOrganizationSchema,
]);
export type ICreatePersonInput = z.infer<typeof CreatePersonSchema>;
