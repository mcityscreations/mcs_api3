import z from 'zod';

export const I18nSchema = z.object({
	idLanguage: z
		.string()
		.trim()
		.toLowerCase()
		.length(2, 'Language must be an ISO 639-1 alpha-2 code.'),
	value: z
		.string('A translation value must be provided.')
		.min(1, 'A translation value cannot be empty.')
		.trim(),
	slug: z.string().optional(),
});
export type Ii18n = z.infer<typeof I18nSchema>;
