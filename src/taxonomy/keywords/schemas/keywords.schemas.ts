// src/taxonomy/keywords/schemas/keywords.schemas.ts
import z from 'zod';

// Schema for creating a new keyword
export const CreateKeywordSchema = z.object({
	name: z
		.array(
			z.object({
				idLanguage: z.uuidv7(),
				value: z.string().min(1).max(100),
			}),
		)
		.min(1),
});
export type ICreateKeywordDto = z.infer<typeof CreateKeywordSchema>;

// Schema for reading an existing keyword
export const ReadKeywordSchema = z.object({
	id: z.uuidv7().describe('Unique identifier for the keyword'),
	name: z.string().min(1).max(100).describe('Value of the keyword'),
	createdAt: z
		.date()
		.optional()
		.describe('Timestamp when the keyword was created'),
	updatedAt: z
		.date()
		.optional()
		.describe('Timestamp when the keyword was last updated'),
});
export type IReadKeywordDto = z.infer<typeof ReadKeywordSchema>;

// Schema for updating an existing keyword
export const UpdateKeywordSchema = z.object({
	id: z.uuidv7(),
	name: z
		.array(
			z.object({
				idLanguage: z.uuidv7(),
				value: z.string().min(1).max(100),
			}),
		)
		.min(1)
		.optional(),
});
export type IUpdateKeywordDto = z.infer<typeof UpdateKeywordSchema>;
