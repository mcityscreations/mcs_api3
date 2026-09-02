import z from 'zod';

export const CountryMapSchema = z.object({
	idCountry: z.union([
		z.string().min(1, 'Country ID cannot be empty'),
		z.number().transform((value) => String(value)),
	]),
	systemSource: z.string().min(1, 'System source must be provided'),
});
export type ICountryMap = z.infer<typeof CountryMapSchema>;
