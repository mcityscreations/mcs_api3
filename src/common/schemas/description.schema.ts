import z from 'zod';

const DescriptionItemSchema = z.object({
	idLanguage: z
		.string()
		.trim()
		.toLowerCase()
		.length(2, 'Language must be an ISO 639-1 alpha-2 code.'),
	description: z
		.string('A description must be provided')
		.trim()
		.min(1, 'A description cannot be empty.'),
});

const CreateDescriptionSchema = z.array(DescriptionItemSchema);

const ReadDescriptionSchema = DescriptionItemSchema.omit({
	idLanguage: true,
});
type IDescription = z.infer<typeof CreateDescriptionSchema>;
type IReadDescription = z.infer<typeof ReadDescriptionSchema>;

export { CreateDescriptionSchema, ReadDescriptionSchema };
export type { IDescription, IReadDescription };
