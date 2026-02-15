import z from 'zod';

const CreateTitleSchema = z.object({
	idLanguage: z.uuidv7(),
	title: z.string(),
});

const ReadTitleSchema = z.string();

type ICreateTitle = z.infer<typeof CreateTitleSchema>;
type IReadTitle = z.infer<typeof ReadTitleSchema>;

export { CreateTitleSchema, ReadTitleSchema };
export type { ICreateTitle, IReadTitle };
