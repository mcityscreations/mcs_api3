import { z } from 'zod';

/// Utility to convert string values to integers, treating empty strings and non-numeric strings as 0.
/**
 * This utility is designed to handle the common scenario in PrestaShop XML responses where numeric values are often represented as strings.
 * It ensures that any string input is safely converted to a non-negative integer, defaulting to 0 for invalid or empty strings.
 */

export const ZodStringToInteger = z.preprocess((val: unknown) => {
	// 1. If the value is null or undefined, do nothing
	if (val === undefined || val === null) {
		return val;
	}

	// 2. Extracting the XML object { '#text': 5, 'xlink:href': '...' }
	if (typeof val === 'object') {
		const node = val as Record<string, unknown>;
		const extracted = node['#text'] ?? node['#'] ?? node['_'];

		if (extracted === undefined) return null;
		val = extracted;
	}

	// 3. If it's a number (case where '#text' is already the number 5)
	if (typeof val === 'number') {
		return val;
	}

	// 4. If it's a string
	if (typeof val === 'string') {
		const trimmed = val.trim();
		if (trimmed === '') return null;

		const parsed = Number.parseInt(trimmed, 10);
		return Number.isNaN(parsed) ? null : parsed;
	}

	return null;
}, z.number().int().nonnegative().nullable().optional());
