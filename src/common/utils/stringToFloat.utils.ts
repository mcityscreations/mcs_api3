import z from 'zod';

export const ZodStringToFloat = z.preprocess((val) => {
	const parsed = parseFloat(val as string);
	return isNaN(parsed) ? null : parsed;
}, z.number().nullable().optional());
