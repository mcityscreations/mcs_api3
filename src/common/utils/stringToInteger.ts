import { z } from 'zod';

/// Utility to convert string values to integers, treating empty strings and non-numeric strings as 0.
/**
 * This utility is designed to handle the common scenario in PrestaShop XML responses where numeric values are often represented as strings.
 * It ensures that any string input is safely converted to a non-negative integer, defaulting to 0 for invalid or empty strings.
 */
export const ZodStringToInteger = z.preprocess((val) => {
	if (typeof val !== 'string' || val.trim() === '') return 0;
	const intValue = parseInt(val, 10);
	return isNaN(intValue) ? 0 : intValue;
}, z.number().int().nonnegative());
