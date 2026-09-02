// src/system/als/als.service.ts
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

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
	source: 'http' | 'worker' | 'cron' | 'other';
}

@Injectable()
export class AlsService {
	private static readonly als = new AsyncLocalStorage<Store>();

	// Runs a function within a context containing the provided store data
	// The callback function will have access to this context
	static run(store: Store, callback: (...args: any[]) => void) {
		this.als.run(store, callback);
	}

	// Returns the correlation ID associated to the current thread
	static get correlationId(): string | undefined {
		return this.als.getStore()?.correlationId;
	}
	// Returns the IP address associated to the current thread
	static get ipAddress(): string | undefined {
		return this.als.getStore()?.ipAddress;
	}
	// Returns the source associated to the current thread
	static get source(): 'http' | 'worker' | 'cron' | 'other' | undefined {
		return this.als.getStore()?.source;
	}
}
