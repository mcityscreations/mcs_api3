import { z } from 'zod';
export const CreateArtworkI18nSchema = z.object({
	idArtwork: z
		.number('Artwork ID must be provided')
		.int('Artwork ID must be an integer')
		.positive('Artwork ID must be positive'),
	idLanguage: z.uuidv7('Language ID must be provided'),
	title: z.string().min(1, 'Title must be provided'),
	description: z.string(),
	slug: z.string(),
});
export type ICreateArtworkI18n = z.infer<typeof CreateArtworkI18nSchema>;
