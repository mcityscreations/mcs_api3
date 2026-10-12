import z from 'zod';

const DimensionsSchema = z.object({
	width: z
		.number('Width must be a number')
		.int('Width must be an integer')
		.positive('Width must be a positive number')
		.describe('Width in millimeters'),
	height: z
		.number('Height must be a number')
		.int('Height must be an integer')
		.positive('Height must be a positive number')
		.describe('Height in millimeters'),
	depth: z
		.number('Depth must be a number')
		.int('Depth must be an integer')
		.positive('Depth must be a positive number')
		.optional()
		.describe('Depth in millimeters'), // Optional for 2D artworks
});

type IDimensions = z.infer<typeof DimensionsSchema>;

export { DimensionsSchema };
export type { IDimensions };
