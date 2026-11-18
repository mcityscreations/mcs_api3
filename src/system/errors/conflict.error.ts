import { DomainError } from './domain.error.js';

export class ConflictError extends DomainError {
	readonly code = 'BAD_REQUEST';
	constructor(message: string) {
		super(message);
	}
}
