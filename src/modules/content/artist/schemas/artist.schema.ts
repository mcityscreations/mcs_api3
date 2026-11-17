import { z } from 'zod';
import { I18nSchema } from '../../../../common/schemas/i18n.schema.js';

export const ArtistSchema = z.object({
	id: z.uuidv7(),
	name: z.string().min(1),
	pseudonym: z.string().optional(),
	bio: z.array(I18nSchema),
	createdAt: z.date(),
	updatedAt: z.date(),
});
export type IArtist = z.infer<typeof ArtistSchema>;

export const IArtistI18nSchema = ArtistSchema.pick({
	id: true,
	name: true,
	pseudonym: true,
	createdAt: true,
	updatedAt: true,
}).extend({
	bio: z.string(),
});
export type IArtistI18n = z.infer<typeof IArtistI18nSchema>;
