// src/modules/content/taxonomy/categories/schemas/category.schemas.ts
import { z } from 'zod';
import { I18nSchema } from '../../../../../common/schemas/i18n.schema.js';

// Schema for creating a new category
export const CreateCategorySchema = z.object({
	name: z.string().min(3).max(150),
	i18n: z.array(I18nSchema),
	isPublic: z.boolean(),
	hasDimensions: z.boolean(),
});
export type ICreateCategoryDto = z.infer<typeof CreateCategorySchema>;

// Schema for reading an existing category
export const AdminReadCategorySchema = z.object({
	id: z.uuidv7().describe('Unique identifier for the category'),
	name: z.string().min(3).max(150).describe('Name of the category'),
	i18n: z.array(I18nSchema),
	isPublic: z.boolean().describe('Indicates if the category is public'),
	hasDimensions: z
		.boolean()
		.describe('Indicates if the category has dimensions'),
	createdAt: z
		.date()
		.optional()
		.describe('Timestamp when the category was created'),

	updatedAt: z
		.date()
		.optional()
		.describe('Timestamp when the category was last updated'),
});
export type IAdminReadCategory = z.infer<typeof AdminReadCategorySchema>;

// Schema for updating an existing category
export const UpdateCategorySchema = AdminReadCategorySchema.omit({
	createdAt: true,
	updatedAt: true,
});
export type IUpdateCategory = z.infer<typeof UpdateCategorySchema>;

export const PublicReadCategorySchema = z.object({
	id: z.uuidv7().describe('Unique identifier for the category'),
	name: z.string().min(3).max(150).describe('Name of the category'),
	slug: z.string().min(3).max(150).describe('Slug for the category'),
	isPublic: z.boolean().describe('Indicates if the category is public'),
	hasDimensions: z
		.boolean()
		.describe('Indicates if the category has dimensions'),
	createdAt: z
		.date()
		.optional()
		.describe('Timestamp when the category was created'),
	updatedAt: z
		.date()
		.optional()
		.describe('Timestamp when the category was last updated'),
});
export type IPublicReadCategory = z.infer<typeof PublicReadCategorySchema>;
