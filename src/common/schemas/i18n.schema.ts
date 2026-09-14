import z from 'zod';

export const I18nSchema = z.object({
	idLanguage: z.uuidv7(),
	value: z.string(),
});
export type Ii18n = z.infer<typeof I18nSchema>;
