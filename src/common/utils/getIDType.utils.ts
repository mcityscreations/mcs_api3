import { isUuidV7 } from '../validators/isuuidv7.validator.js';

export type IiDType = 'public' | 'private' | 'invalid';

export function getIDType(incomingID): IiDType {
	if (isUuidV7(incomingID)) return 'private';
	if (Number.isInteger(incomingID) && incomingID > 0) return 'public';
	return 'invalid';
}
