// src/system/errors/not-found.error.ts
import { DomainError } from './domain.error.js';

export class NotFoundError extends DomainError {
	readonly code: string = 'NOT_FOUND';
	constructor(message: string) {
		super(message);
	}
}
