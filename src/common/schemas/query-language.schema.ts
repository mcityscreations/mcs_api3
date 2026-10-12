import { z } from 'zod';

export const LanguageQuerySchema = z.object({
	lang: z
		.string()
		.regex(/^[a-z]{2}$/, {
			message: 'Language code must be a two-letter ISO 639-1 code.',
		})
		.nullable()
		.optional(),
});
