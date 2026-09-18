import z from 'zod';

const CreateTitleSchema = z.array(
	z.object({
		idLanguage: z.uuidv7(),
		title: z.string('A title must be provided'),
	}),
);

const ReadTitleSchema = z.string();

type ICreateTitle = z.infer<typeof CreateTitleSchema>;
type IReadTitle = z.infer<typeof ReadTitleSchema>;

export { CreateTitleSchema, ReadTitleSchema };
export type { ICreateTitle, IReadTitle };
