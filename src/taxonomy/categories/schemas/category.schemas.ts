// src/taxonomy/categories/schemas/category.schemas.ts
import { z } from 'zod';

// Schema for creating a new category
export const CreateCategorySchema = z.object({
	name: z
		.array(
			z.object({
				idLanguage: z.uuidv7(), // ou z.string().uuid()
				title: z.string().min(3).max(150),
			}),
		)
		.min(1),
	isPublic: z.boolean(),
	hasDimensions: z.boolean(),
});
export type ICreateCategoryDto = z.infer<typeof CreateCategorySchema>;

// Schema for reading an existing category
export const ReadCategorySchema = z.object({
	id: z.uuidv7().describe('Unique identifier for the category'),
	name: z.string().min(3).max(150).describe('Name of the category'),
	isPublic: z.boolean().describe('Indicates if the category is public'),
	hasDimensions: z
		.boolean()
		.describe('Indicates if the category has dimensions'),
	createdAt: z.coerce
		.date()
		.optional()
		.describe('Timestamp when the category was created'),

	updatedAt: z.coerce
		.date()
		.optional()
		.describe('Timestamp when the category was last updated'),
});
export type IReadCategoryDto = z.infer<typeof ReadCategorySchema>;

// Schema for updating an existing category
export const UpdateCategorySchema = z.object({
	name: z
		.array(
			z.object({
				idLanguage: z.uuidv7(),
				title: z.string().min(3).max(150),
			}),
		)
		.min(1)
		.optional(),
	isPublic: z.boolean().optional(),
	hasDimensions: z.boolean().optional(),
});
export type IUpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
