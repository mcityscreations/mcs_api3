import { z } from 'zod';
import { I18nSchema } from '../../../../../common/schemas/i18n.schema.js';

export const LanguagesSchema = z.object({
	id: z.uuidv7().describe('Unique identifier for the language'),
	name: z.string().min(3).max(150).describe('Name of the language'),
	i18n: z.array(I18nSchema),
	slug: z.string().min(3).max(150).describe('Slug for the language'),
	createdAt: z
		.date()
		.optional()
		.describe('Timestamp when the language was created'),
	updatedAt: z
		.date()
		.optional()
		.describe('Timestamp when the language was last updated'),
});
export type ILanguage = z.infer<typeof LanguagesSchema>;

export const LanguageParamSchema = z.string().regex(/^[a-z]{2}$/, {
	message: 'Language code must be a two-letter ISO 639-1 code.',
});
export type ILanguageParam = z.infer<typeof LanguageParamSchema>;
