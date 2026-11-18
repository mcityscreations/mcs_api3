import { z } from 'zod';
export const UtcDateSchema = z.coerce
	.date()
	.transform((date) => date.toISOString())
	.pipe(z.iso.datetime());
