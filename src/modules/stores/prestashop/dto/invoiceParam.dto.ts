import { createZodDto } from 'nestjs-zod';
import { PrestashopInvoiceIDSchema } from '../schemas/invoices.schema.js';

export class PrestashopInvoiceIDDto extends createZodDto(
	PrestashopInvoiceIDSchema,
) {}
