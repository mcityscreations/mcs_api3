import z from 'zod';

export const CountrySchema = z.object({
	id: z.number().int().nonnegative(),
	id_public: z.uuidv7(),
	iso2: z.string().length(2),
	iso3: z.string().length(3).optional(),
	name: z.string(),
	country_groups: z.array(
		z.object({
			id: z.number().int().nonnegative(),
			code: z.string(),
			name: z.string(),
		}),
	),
});
export type ICountry = z.infer<typeof CountrySchema>;
