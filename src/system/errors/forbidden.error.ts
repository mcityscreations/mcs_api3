import { DomainError } from './domain.error.js';

export class ForbiddenError extends DomainError {
	readonly code = 'FORBIDDEN';
	constructor(message: string) {
		super(message);
	}
}
