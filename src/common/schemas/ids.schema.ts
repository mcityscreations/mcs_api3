import z from 'zod';

export const IdsSchema = z.object({
	idPrivate: z.number(),
	idPublic: z.uuidv7(),
});

export type IIds = z.infer<typeof IdsSchema>;

export const UuidSchema = z.object({
	id: z.uuidv7(),
});
export type IUuid = z.infer<typeof UuidSchema>;
