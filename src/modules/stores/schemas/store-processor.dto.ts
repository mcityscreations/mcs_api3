import { z } from 'zod';

export const StoreProcessorDtoSchema = z.object({
	id: z.coerce.string(),
	source_system: z.string(),
});

export type IStoreProcessorDto = z.infer<typeof StoreProcessorDtoSchema>;
