import z from 'zod';

export const IndividualSchema = z.object({
	type: z.literal('individual'),
	firstName: z.string().min(3, 'First name is required'),
	lastName: z.string().min(3, 'Last name is required'),
});
export type IIndividual = z.infer<typeof IndividualSchema>;
