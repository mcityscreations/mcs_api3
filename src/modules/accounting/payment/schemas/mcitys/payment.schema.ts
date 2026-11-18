import { z } from 'zod';
import { currenciesEnum } from '../../../currency/schemas/currency.enum.js';
import { UtcDateSchema } from '../../../../../common/dates/utcDate.schema.js';

export const McitysPaymentSchema = z.object({
	id_payment: z.uuidv7(),
	id_invoice: z.uuidv7(),
	system_source: z.string(),
	id_payment_source: z.string(),
	id_transaction: z.string().nullable().optional(),
	payment_method: z.object({
		id: z.uuidv7(),
		label: z.string().min(1),
	}),
	payment_direction: z
		.enum(['debit', 'credit', 'transfer'])
		.nullable()
		.optional(),
	amount: z.number().int().nonnegative(),
	currency: currenciesEnum,
	paid_at: UtcDateSchema,
});
export type IMcitysPayment = z.infer<typeof McitysPaymentSchema>;

export const McitysCreatePaymentSchema = z.object({
	system_source: z.enum(['qonto', 'prestashop']),
	id_payment_source: z.string().min(1),
	source_data: z.string(),
	id_invoice: z.uuidv7().nullable().optional(),
	id_order: z.string().nullable().optional(),
	id_transaction: z.string().nullable().optional(),
	payment_method: z.uuidv7(),
	amount: z.number().int().nonnegative(),
	currency: currenciesEnum,
	paid_at: UtcDateSchema,
});
export type ICreateMcitysPayment = z.infer<typeof McitysCreatePaymentSchema>;
