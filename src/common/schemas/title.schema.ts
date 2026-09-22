import z from 'zod';

const CreateTitleSchema = z.array(
	z.object({
		idLanguage: z
			.string()
			.trim()
			.toLowerCase()
			.length(2, 'Language must be an ISO 639-1 alpha-2 code.'),
		title: z
			.string('A title must be provided')
			.trim()
			.min(1, 'A translation value cannot be empty.'),
	}),
);

const ReadTitleSchema = z.string();

type ICreateTitle = z.infer<typeof CreateTitleSchema>;
type IReadTitle = z.infer<typeof ReadTitleSchema>;

export { CreateTitleSchema, ReadTitleSchema };
export type { ICreateTitle, IReadTitle };
