import z from 'zod';

const DescriptionItemSchema = z.object({
	idLanguage: z.uuidv7(),
	description: z.string().min(1, 'A description must be provided'),
});

const CreateDescriptionSchema = z.array(DescriptionItemSchema);

const ReadDescriptionSchema = DescriptionItemSchema.omit({
	idLanguage: true,
});
type IDescription = z.infer<typeof CreateDescriptionSchema>;
type IReadDescription = z.infer<typeof ReadDescriptionSchema>;

export { CreateDescriptionSchema, ReadDescriptionSchema };
export type { IDescription, IReadDescription };
