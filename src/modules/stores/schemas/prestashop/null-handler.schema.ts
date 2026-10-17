import { z } from 'zod';

export const stringOrNullFromPrestashopSchema = z.preprocess((val) => {
	if (val === '0' || val === 0 || val === '' || val === undefined) {
		return null;
	}
	return val;
}, z.coerce.string().nullable().optional());

export const numberOrNullFromPrestashopSchema = z.preprocess((val) => {
	if (
		val === '0' ||
		val === 0 ||
		val === '' ||
		val === undefined ||
		val === null
	) {
		return null;
	}
	const parsed = Number(val);
	return isNaN(parsed) ? null : parsed;
}, z.number().nullable().optional());
