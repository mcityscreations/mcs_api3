import z from 'zod';

export function arrayValidator<T>(zodSchema: z.ZodType<T>, data: T[]): boolean {
	const schemaToValidate = z.array(zodSchema);
	return schemaToValidate.safeParse(data).success;
}
