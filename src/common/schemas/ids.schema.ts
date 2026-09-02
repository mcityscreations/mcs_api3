import z from 'zod';

export const IdsSchema = z.object({
	idPrivate: z.number(),
	idPublic: z.uuidv7(),
});

export type IIds = z.infer<typeof IdsSchema>;
