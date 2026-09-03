// src/system/errors/validation.error.ts
import { DomainError } from './domain.error.js';

export class ValidationError extends DomainError {
	readonly code: string = 'VALIDATION_ERROR';
	constructor(message: string) {
		super(message);
	}
}
