// src/modules/content/taxonomy/keywords/schemas/keywords.schemas.ts
import z from 'zod';
import { I18nSchema } from '../../../../../common/schemas/i18n.schema.js';

// Schema for creating a new keyword
export const CreateKeywordSchema = z.object({
	name: z
		.array(
			z.object({
				idLanguage: z.uuidv7().describe('Unique identifier for the language'),
				value: z
					.string()
					.min(1)
					.max(100)
					.describe('Value of the keyword in the specified language'),
				slug: z
					.string()
					.min(1)
					.max(100)
					.describe('Slug of the keyword in the specified language'),
			}),
		)
		.min(1),
});
export type ICreateKeywordDto = z.infer<typeof CreateKeywordSchema>;

const MetadataSchema = z.object({
	createdAt: z
		.date()
		.optional()
		.describe('Timestamp when the keyword was created'),
	updatedAt: z
		.date()
		.optional()
		.describe('Timestamp when the keyword was last updated'),
});

// Schema for reading an existing keyword
export const ReadAdminKeywordSchema = z.object({
	id: z.uuidv7().describe('Unique identifier for the keyword'),
	name: z.string().min(1).max(100).describe('Value of the keyword'),
	i18n: z
		.array(I18nSchema)
		.describe('Internationalization data for the keyword'),
	...MetadataSchema.shape,
});
export type IReadAdminKeywordDto = z.infer<typeof ReadAdminKeywordSchema>;

// Schema for reading a public keyword (without i18n property)
export const ReadPublicKeywordSchema = z.object({
	id: z.uuidv7().describe('Unique identifier for the keyword'),
	name: z.string().min(1).max(100).describe('Translated value of the keyword'),
	slug: z.string().min(1).max(100).describe('Translated slug of the keyword'),
	...MetadataSchema.shape,
});
export type IReadPublicKeywordDto = z.infer<typeof ReadPublicKeywordSchema>;

// Schema for updating an existing keyword
export const UpdateKeywordSchema = z.object({
	id: z.uuidv7(),
	name: z.array(I18nSchema).min(1).optional(),
});
export type IUpdateKeywordDto = z.infer<typeof UpdateKeywordSchema>;
