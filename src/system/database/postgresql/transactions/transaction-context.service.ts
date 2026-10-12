// src/system/database/postgresql/transactions/transaction.service.ts
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import type { PoolClient } from 'pg';

@Injectable()
export class TransactionContext {
	private readonly als = new AsyncLocalStorage<PoolClient>();

	/**
	 * @param client - The PoolClient representing the transaction context.
	 * @param callback - The function to execute within the transaction context.
	 * Executes a callback within the context of the given transaction client.
	 */
	run<T>(client: PoolClient, callback: () => Promise<T>): Promise<T> {
		return this.als.run(client, callback);
	}

	/**
	 * Retrieves the transaction client from the current asynchronous execution context.
	 */
	getClient(): PoolClient | undefined {
		return this.als.getStore();
	}
}
