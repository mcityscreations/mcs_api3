// src/taxonomy/categories/schemas/category.schemas.ts
import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.uuidv7().describe('Unique identifier for the category'),
  name: z.string().min(3).max(150).describe('Name of the category'),
  isPublic: z.boolean().describe('Indicates if the category is public'),
  hasDimensions: z.boolean().describe('Indicates if the category has dimensions'),
  createdAt: z.date().optional().describe('Timestamp when the category was created'),
  updatedAt: z.date().optional().describe('Timestamp when the category was last updated'),
});

export type ICategory = z.infer<typeof CategorySchema>;

// Create category schema (omit id, createdAt, updatedAt)
export const CreateCategorySchema = CategorySchema.omit({ id: true, createdAt: true, updatedAt: true });
export type ICreateCategory = z.infer<typeof CreateCategorySchema>;

// Update category schema (partial, with id required)
export const UpdateCategorySchema = CategorySchema.partial().extend({
  id: z.uuidv7().describe('Unique identifier for the category'),
});
export type IUpdateCategory = z.infer<typeof UpdateCategorySchema>;

// Read category schema (same as CategorySchema)
export const ReadCategorySchema = CategorySchema;
export type IReadCategory = z.infer<typeof ReadCategorySchema>;