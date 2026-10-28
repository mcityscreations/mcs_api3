import { z } from 'zod';
import { currenciesEnum } from './currencies.schema.js';
import { UtcDateSchema } from '../../../../common/dates/utcDate.schema.js';

export const McitysPaymentSchema = z.object({
	id_payment: z.uuidv7(),
	id_transaction: z.string().nullable().optional(),
	payment_method: z.string(),
	amount: z.number().int().nonnegative(),
	currency: currenciesEnum,
	payment_date: UtcDateSchema,
});
export type IMcitysPayment = z.infer<typeof McitysPaymentSchema>;

export const McitysCreatePaymentSchema = McitysPaymentSchema.omit({
	id_payment: true,
});
export type ICreateMcitysPayment = z.infer<typeof McitysCreatePaymentSchema>;
