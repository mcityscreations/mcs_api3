import { z } from 'zod';

export const InvoiceStoreDtoSchema = z.object({
	id: z.coerce.string(),
	source_system: z.string(),
});

export type IInvoiceStoreDto = z.infer<typeof InvoiceStoreDtoSchema>;
