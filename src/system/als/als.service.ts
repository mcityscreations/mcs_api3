// src/system/als/als.service.ts
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * @description Service to manage Asynchronous Local Storage (ALS)
 * It allows storing and retrieving data specific to the current asynchronous context,
 * such as correlation IDs and IP addresses for requests.
 * This is useful for tracking requests across asynchronous operations.
 */

// Interface of the context to be stored
interface Store {
	correlationId: string;
	ipAddress: string;
}

@Injectable()
export class AlsService {
	private readonly als = new AsyncLocalStorage<Store>();

	// Runs a function within a context containing the provided store data
	// The callback function will have access to this context
	run(store: Store, callback: (...args: any[]) => void) {
		this.als.run(store, callback);
	}

	// Returns the correlation ID associated to the current thread
	getCorrelationId(): string | undefined {
		return this.als.getStore()?.correlationId;
	}
	// Returns the IP address associated to the current thread
	getIP(): string | undefined {
		return this.als.getStore()?.ipAddress;
	}
}
