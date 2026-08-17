import z from 'zod';

export const PersonMapperSchema = z.object({
	idPerson: z.union([z.string(), z.number()]),
	idPublic: z.string(),
	systemSource: z.string(),
	idPersonSource: z.string(),
	isProfessional: z.boolean(),
	isAbroad: z.boolean(),
	sourceData: z.string(),
});
export type IPersonMapper = z.infer<typeof PersonMapperSchema>;
