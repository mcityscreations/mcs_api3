// src/modules/content/artworks/types/create-artwork.dto.ts

import { z } from 'zod';
import { I18nSchema } from '../../../../common/schemas/i18n.schema.js';
import { DimensionsSchema } from '../../../../common/schemas/dimensions.schema.js';

const CreateArtworkSchema = z.object({
	idArtist: z.uuidv7('An artist UUIDv7 ID must be provided').optional(),
	idCategory: z.uuidv7('A category ID must be provided'),
	idTechnique: z.uuidv7('A technique ID must be provided'),
	idSubject: z.uuidv7('A subject ID must be provided'),
	releaseDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'The date format must be YYYY-MM-DD')
		.transform((dateString) => new Date(dateString))
		.refine((date) => !isNaN(date.getTime()), {
			message: 'Invalid date',
		}),
	dimensions: DimensionsSchema,
	title: z.array(I18nSchema),
	description: z.array(I18nSchema),
	price: z
		.object({
			withoutFrame: z.number(),
			withFrame: z.number(),
		})
		.optional(),
	keywords: z.array(z.uuidv7('Keyword parameter must be an UUIDv7 array')),
});

type ICreateArtwork = z.infer<typeof CreateArtworkSchema>;

export { CreateArtworkSchema };
export type { ICreateArtwork };
