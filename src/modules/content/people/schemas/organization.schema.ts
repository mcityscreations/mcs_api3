import z from 'zod';

export const OrganizationSchema = z.object({
	type: z.literal('organization'),
	legalName: z.string().min(3, 'Legal name is required'),
	category: z.object({
		id: z.string(),
		name: z.string(),
	}),
	registrationCountry: z.object({
		id: z.string(),
		name: z.string(),
	}),
	idRegistration: z.string(),
	idVAT: z.string(),
});

export type IOrganization = z.infer<typeof OrganizationSchema>;
