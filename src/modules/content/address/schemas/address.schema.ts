import { z } from 'zod';

export const AddressSchema = z.object({
	address1: z.string().optional(),
	address2: z.string().optional(),
	address3: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	zipCode: z.string().optional(),
	country: z.object({
		iso3: z.string().length(3),
		name: z.string(),
	}),
	phone: z.string().optional(),
});
export type IAddress = z.infer<typeof AddressSchema>;
