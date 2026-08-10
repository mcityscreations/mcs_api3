import z from 'zod';
const namedRefSchema = z.object({
	id: z.uuidv7(),
	name: z.string(),
});
export const OrganizationSchema = z.object({
	id: z.uuidv7(),
	type: z.literal('organization'),
	details: z.object({
		category: namedRefSchema,
		legalName: z.string().min(3, 'Legal name is required'),
		registrationCountry: namedRefSchema,
		idRegistration: z.string(),
		idVAT: z.string(),
	}),
});
export type IOrganizationPublic = z.infer<typeof OrganizationSchema>;

const flexRefSchema = z.union([z.uuidv7(), z.number().int().positive()]);
export const CreateOrganizationSchema = z.object({
	type: z.literal('organization'),
	details: z.object({
		legalName: z.string().min(1, 'Legal name is required'),
		category: flexRefSchema,
		registrationCountry: flexRefSchema,
		idRegistration: z.string().optional(),
		idVAT: z.string().optional(),
	}),
});
export type ICreateOrganization = z.infer<typeof CreateOrganizationSchema>;
