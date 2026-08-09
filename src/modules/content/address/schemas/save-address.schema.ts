import { z } from 'zod';
import { AddressSchema } from './address.schema.js';

export const SaveAddressSchema = z.object({
	idPerson: z.number().int().positive(),
	name: z.string().trim().min(1).default('default'),
	address: AddressSchema,
	isDefault: z.boolean().optional().default(false),
});

export type ISaveAddress = z.infer<typeof SaveAddressSchema>;
