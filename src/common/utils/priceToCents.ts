import z from 'zod';

// Helper to convert decimal price strings from PrestaShop into integer cents (e.g. "12.34" -> 1234)
export const ZodPriceToCents = z.preprocess((val) => {
	if (typeof val !== 'string' || val.trim() === '') return 0;
	const floatValue = Number.parseFloat(val);
	return Number.isNaN(floatValue) ? 0 : Math.round(floatValue * 100);
}, z.number().int().nonnegative());
