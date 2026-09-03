// src/system/errors/internal.error.ts
import { DomainError } from './domain.error.js';

export class InternalError extends DomainError {
	readonly code = 'INTERNAL_ERROR';
	constructor(message: string) {
		super(message);
	}
}
