import { z } from 'zod';
import { LanguageQuerySchema } from '../../../../../common/schemas/query-language.schema.js';

export const CategoryQuerySchema = LanguageQuerySchema.extend({
	entityId: z
		.uuidv7()
		.optional()
		.describe('UUID of the parent entity (Artwork, Product etc.)'),
});
