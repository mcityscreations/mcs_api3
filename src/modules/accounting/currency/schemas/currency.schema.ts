import { z } from 'zod';

export const McitysCurrencySchema = z.object({
	id_currency: z.string().min(1),
	iso_alpha_3_code: z.string().min(3).max(3),
	iso_digit_code: z.number().int().nonnegative(),
	name: z.string().min(1),
	symbol: z.string().min(1).optional(),
	display_format: z.string().min(1).optional(),
});

export type ICurrency = z.infer<typeof McitysCurrencySchema>;
