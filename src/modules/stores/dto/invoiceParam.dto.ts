import { createZodDto } from 'nestjs-zod';
import { PrestashopInvoiceIDSchema } from '../schemas/prestashop/invoices.schema.js';

export class PrestashopInvoiceIDDto extends createZodDto(
	PrestashopInvoiceIDSchema,
) {}
