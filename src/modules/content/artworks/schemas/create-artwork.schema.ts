// src/modules/content/artworks/types/create-artwork.dto.ts

import { z } from 'zod';
import { CreateTitleSchema } from '../../../../common/schemas/title.schema.js';
import { CreateDescriptionSchema } from '../../../../common/schemas/description.schema.js';
import { DimensionsSchema } from '../../../../common/schemas/dimensions.schema.js';

const CreateArtworkSchema = z.object({
	idArtist: z.uuidv7('An artist ID must be provided'),
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
	title: CreateTitleSchema,
	description: CreateDescriptionSchema,
	price: z
		.object({
			price: z.number(),
			priceWithFrame: z.number(),
		})
		.optional(),
	keywords: z.array(z.uuidv7('Keyword ID must be a string')),
});

type ICreateArtwork = z.infer<typeof CreateArtworkSchema>;

export { CreateArtworkSchema };
export type { ICreateArtwork };
