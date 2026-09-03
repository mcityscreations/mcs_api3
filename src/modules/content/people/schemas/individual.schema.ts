import z from 'zod';

export const IndividualSchema = z.object({
	id: z.uuidv7(),
	type: z.literal('individual'),
	details: z.object({
		firstName: z.string().min(3, 'First name is required'),
		lastName: z.string().min(3, 'Last name is required'),
	}),
});
export type IIndividual = z.infer<typeof IndividualSchema>;

export const CreateIndividualSchema = z.object({
	type: z.literal('individual'),
	details: z.object({
		firstName: z.string().min(3, 'First name is required'),
		lastName: z.string().min(3, 'Last name is required'),
	}),
});
export type ICreateIndividual = z.infer<typeof CreateIndividualSchema>;
