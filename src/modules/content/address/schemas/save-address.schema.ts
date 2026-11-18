import { z } from 'zod';
import { AddressValueSchema } from './address.schema.js';

export const SaveAddressSchema = z.object({
	idPerson: z.uuidv7(),
	systemSource: z.string().nullable().optional(),
	idSource: z.string().nullable().optional(),
	name: z.string().trim().min(1).default('default'),
	address: AddressValueSchema,
	isDefault: z.boolean().optional().default(false),
	isBillingAddress: z.boolean().optional().default(false),
});

export type ISaveAddress = z.infer<typeof SaveAddressSchema>;
