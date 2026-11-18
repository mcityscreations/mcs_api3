import { z } from 'zod';
export const ZodFilterAttribute = z.preprocess(
	(val: unknown) => {
		// 1. If the value is null or undefined, do nothing
		if (val === undefined || val === null) {
			return val;
		}
		if (typeof val === 'object') {
			const node = val as Record<string, unknown>;
			const extracted = node['#text'] ?? node['#'] ?? node['_'];

			if (extracted === undefined) return null;
			val = extracted;
		}
		return null;
	},
	z.union([z.string().nullable().optional(), z.number().nullable().optional()]),
);
