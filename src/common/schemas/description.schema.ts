import z from 'zod';

const CreateDescriptionSchema = z.object({
	idLanguage: z.uuidv7().optional(), // Only required when creating/updating descriptions, not when fetching
	description: z.string(),
});

const ReadDescriptionSchema = z.string();

type IDescription = z.infer<typeof CreateDescriptionSchema>;
type IReadDescription = z.infer<typeof ReadDescriptionSchema>;

export { CreateDescriptionSchema, ReadDescriptionSchema };
export type { IDescription, IReadDescription };
