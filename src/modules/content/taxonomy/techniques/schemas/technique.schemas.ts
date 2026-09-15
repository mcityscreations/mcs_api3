import { z } from 'zod';
import { I18nSchema } from '../../../../../common/schemas/i18n.schema.js';

export const AdminReadTechniqueSchema = z.object({
	id: z.uuidv7().describe('Unique identifier for the technique'),
	name: z.string().min(3).max(150).describe('Name of the technique'),
	i18n: z.array(I18nSchema),
	isPublic: z.boolean().describe('Indicates if the technique is public'),
	createdAt: z
		.date()
		.optional()
		.describe('Timestamp when the technique was created'),
	updatedAt: z
		.date()
		.optional()
		.describe('Timestamp when the technique was last updated'),
});
export type IAdminReadTechnique = z.infer<typeof AdminReadTechniqueSchema>;
