import { z } from 'zod';
export const CreateArtworkI18nSchema = z.object({
	idArtwork: z
		.number('Artwork ID must be provided')
		.int('Artwork ID must be an integer')
		.positive('Artwork ID must be positive'),
	idLanguage: z
		.string()
		.trim()
		.toLowerCase()
		.length(2, 'Language must be an ISO 639-1 alpha-2 code.'),
	title: z.string().min(1, 'Title must be provided'),
	description: z.string().min(1, 'Description must be provided'),
	slug: z.string(),
});
export type ICreateArtworkI18n = z.infer<typeof CreateArtworkI18nSchema>;
