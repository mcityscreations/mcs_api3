import { z } from 'zod';
import { I18nSchema } from '../../../../../common/schemas/i18n.schema.js';

export const ReadAdminSubjectSchema = z.object({
	id: z.uuidv7().describe('Unique identifier for the subject'),
	name: z.string().min(1).max(255).describe('Name of the subject'),
	i18n: z
		.array(I18nSchema)
		.describe('Internationalization information for the subject'),
	createdAt: z
		.date()
		.optional()
		.describe('Timestamp when the subject was created'),

	updatedAt: z
		.date()
		.optional()
		.describe('Timestamp when the subject was last updated'),
});
export type IReadAdminSubject = z.infer<typeof ReadAdminSubjectSchema>;

export const ReadPublicSubjectSchema = ReadAdminSubjectSchema.omit({
	i18n: true,
	createdAt: true,
	updatedAt: true,
});
export type IReadPublicSubject = z.infer<typeof ReadPublicSubjectSchema>;

export const CreateSubjectSchema = ReadAdminSubjectSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});
export type ICreateSubject = z.infer<typeof CreateSubjectSchema>;
