import z from 'zod';

// Helper to convert decimal price strings from PrestaShop into integer cents (e.g. "12.34" -> 1234)
export const ZodPriceToCents = z.preprocess((val: unknown): number | null => {
	// 1. If the value is null or undefined
	if (val === undefined || val === null) {
		return null;
	}

	// 2. Extract the value if it comes from an XML node with attributes or CDATA
	if (typeof val === 'object') {
		const node = val as Record<string, unknown>;
		const extracted = node['#text'] ?? node['#'] ?? node['_'];
		if (extracted === undefined) return null;
		val = extracted;
	}

	// 3. Convert the decimal price to cents
	const numValue =
		typeof val === 'number' ? val : Number.parseFloat(String(val).trim());

	if (Number.isNaN(numValue)) {
		return null;
	}

	// Multiplie par 100 et arrondit pour éliminer les erreurs de précision binaire (ex: 25.000000 -> 2500)
	return Math.round(numValue * 100);
}, z.number().int().nullable().optional());
