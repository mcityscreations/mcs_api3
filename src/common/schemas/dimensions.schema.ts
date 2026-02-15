import z from 'zod';

const DimensionsSchema = z.object({
	width: z.number(),
	height: z.number(),
	depth: z.number().optional(), // Optional for 2D artworks
});

type IDimensions = z.infer<typeof DimensionsSchema>;

export { DimensionsSchema };
export type { IDimensions };
