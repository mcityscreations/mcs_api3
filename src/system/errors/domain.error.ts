// src/system/errors/domain.error.ts
import { AlsService } from '../als/als.service.js';
export abstract class DomainError extends Error {
	abstract readonly code: string;
	public readonly correlationId?: string;
	public readonly source: string;

	constructor(message: string) {
		super(message);
		this.correlationId = AlsService.correlationId;
		this.source = AlsService.source || 'other';
		this.name = this.constructor.name; // Attributes the name of the child class automatically
		Error.captureStackTrace(this, this.constructor); // Keeps the stack trace clean by excluding the constructor of the child class
	}
}
