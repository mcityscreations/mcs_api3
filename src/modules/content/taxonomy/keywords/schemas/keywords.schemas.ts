// src/modules/content/taxonomy/keywords/schemas/keywords.schemas.ts
import z from 'zod';
import { I18nSchema } from '../../../../../common/schemas/i18n.schema.js';

// Schema for creating a new keyword
export const CreateKeywordSchema = z.object({
	name: z
		.array(
			z.object({
				idLanguage: z.uuidv7(),
				value: z.string().min(1).max(100),
				slug: z.string().min(1).max(100),
			}),
		)
		.min(1),
});
export type ICreateKeywordDto = z.infer<typeof CreateKeywordSchema>;

// Schema for reading an existing keyword
export const ReadAdminKeywordSchema = z.object({
	id: z.uuidv7().describe('Unique identifier for the keyword'),
	name: z.string().min(1).max(100).describe('Value of the keyword'),
	i18n: z
		.array(I18nSchema)
		.describe('Internationalization data for the keyword'),
	createdAt: z
		.date()
		.optional()
		.describe('Timestamp when the keyword was created'),
	updatedAt: z
		.date()
		.optional()
		.describe('Timestamp when the keyword was last updated'),
});
export type IReadAdminKeywordDto = z.infer<typeof ReadAdminKeywordSchema>;

// Schema for reading a public keyword (without i18n data)
export const ReadPublicKeywordSchema = ReadAdminKeywordSchema.omit({
	i18n: true,
});
export type IReadPublicKeywordDto = z.infer<typeof ReadPublicKeywordSchema>;

// Schema for updating an existing keyword
export const UpdateKeywordSchema = z.object({
	id: z.uuidv7(),
	name: z
		.array(
			z.object({
				idLanguage: z.uuidv7(),
				value: z.string().min(1).max(100),
				slug: z.string().min(1).max(100),
			}),
		)
		.min(1)
		.optional(),
});
export type IUpdateKeywordDto = z.infer<typeof UpdateKeywordSchema>;
