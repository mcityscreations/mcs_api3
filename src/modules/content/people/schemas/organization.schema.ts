import z from 'zod';

const idPublic = z.uuidv7();
const idPrivate = z.number().int().positive();

const OrganizationSchemaBase = z.object({
	type: z.literal('organization'),
	legalName: z.string().min(3, 'Legal name is required'),

	idRegistration: z.string(),
	idVAT: z.string(),
});

export const OrganizationSchemaDB = OrganizationSchemaBase.extend({
	category: z.object({
		id: idPrivate,
		name: z.string(),
	}),
	registrationCountry: z.object({
		id: idPrivate,
		name: z.string(),
	}),
});
export type IOrganizationDB = z.infer<typeof OrganizationSchemaDB>;

export const OrganizationSchemaPublic = OrganizationSchemaBase.extend({
	category: z.object({
		id: idPublic,
		name: z.string(),
	}),
	registrationCountry: z.object({
		id: idPublic,
		name: z.string(),
	}),
});
export type IOrganizationPublic = z.infer<typeof OrganizationSchemaPublic>;
