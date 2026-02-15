// src/modules/content/artworks/types/create-artwork.dto.ts

import z from 'zod';
import { CreateTitleSchema } from '../../../../common/schemas/title.schema.js';
import { CreateDescriptionSchema } from '../../../../common/schemas/description.schema.js';
import { DimensionsSchema } from '../../../../common/schemas/dimensions.schema.js';

const CreateArtworkSchema = z.object({
	idArtist: z.uuidv7(),
	idCategory: z.uuidv7(),
	idTechnique: z.uuidv7(),
	idSubject: z.uuidv7(),
	releaseDate: z.string(),
	dimensions: DimensionsSchema,
	title: CreateTitleSchema,
	description: CreateDescriptionSchema,
	price: z.number(),
	keywords: z.array(z.string()),
});

type ICreateArtwork = z.infer<typeof CreateArtworkSchema>;

export { CreateArtworkSchema };
export type { ICreateArtwork };
