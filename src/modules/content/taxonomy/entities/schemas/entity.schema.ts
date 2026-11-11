import { z } from 'zod';

export const EntitySchema = z.object({
	id: z.uuidv7(),
	name: z.string(),
	i18n: z.array(
		z.object({
			idLanguage: z.string(),
			value: z.string(),
			slug: z.string(),
		}),
	),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type IEntity = z.infer<typeof EntitySchema>;

export const Entityi18nSchema = z.object({
	id: z.uuidv7(),
	name: z.string(),
	slug: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type IEntityi18n = z.infer<typeof Entityi18nSchema>;
