// src/system/errors/bad-request.error.ts
import { DomainError } from './domain.error.js';

export class BadRequestError extends DomainError {
	readonly code = 'BAD_REQUEST';
	constructor(message: string) {
		super(message);
	}
}
