import { z } from 'zod';

export const McitysPaymentMethodSchema = z.object({
	id: z.uuidv7(),
	label: z.string().min(1),
});
export type IMcitysPaymentMethod = z.infer<typeof McitysPaymentMethodSchema>;
