import { z } from 'zod';

const BaseContactSchema = z.object({
	idPerson: z.uuidv7(),
	isPrimary: z.boolean(),
	isProfessional: z.boolean(),
	title: z.string().nullable().optional().default('My contact'),
	value: z.string(),
	isVerified: z.boolean().optional().default(false),
});
export const ContactSchema = BaseContactSchema.extend({
	id: z.uuidv7(),
	contactCategory: z.object({ id: z.number(), name: z.string() }),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type IContact = z.infer<typeof ContactSchema>;

export const AddContactSchema = BaseContactSchema.extend({
	contactCategory: z.number(),
});
export type IAddContact = z.infer<typeof AddContactSchema>;
