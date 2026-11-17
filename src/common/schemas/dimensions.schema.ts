import z from 'zod';

const DimensionsSchema = z.object({
	width: z
		.number('Width must be a number')
		.nonnegative('Width must be a non-negative number')
		.describe('Width in millimeters'),
	height: z
		.number('Height must be a number')
		.nonnegative('Height must be a non-negative number')
		.describe('Height in millimeters'),
	depth: z.coerce
		.number('Depth must be a number')
		.nonnegative('Depth must be a non-negative number')
		.optional()
		.default(0)
		.describe('Depth in millimeters'), // Optional for 2D artworks
});

type IDimensions = z.infer<typeof DimensionsSchema>;

export { DimensionsSchema };
export type { IDimensions };
