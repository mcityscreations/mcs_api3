// src/system/database/postgresql/transactions/transaction-manager.service.ts
import { Injectable } from '@nestjs/common';
import { isErrorWithMessage } from '../../../../common/validators/error.validators.js';
import { InternalError } from '../../../errors/index.js';
import { PostgreSQLService, DatabasePool } from '../postgresql.service.js';
import { TransactionContext } from './transaction-context.service.js';

@Injectable()
export class TransactionManager {
	constructor(
		private readonly dbService: PostgreSQLService,
		private readonly txContext: TransactionContext,
	) {}

	async run<T>(
		work: () => Promise<T>,
		databasePool: DatabasePool = 'standard',
	): Promise<T> {
		// 1. Opens a new transaction and gets the client
		const client = await this.dbService.beginTransaction(databasePool);

		// 2. Associates this client with the ALS for the duration of `work()`
		return this.txContext.run(client, async () => {
			try {
				const result = await work();
				await client.query('COMMIT');
				return result;
			} catch (error) {
				try {
					await client.query('ROLLBACK');
				} catch (rollbackError) {
					throw new InternalError(
						'Transaction rollback failed: ' +
							(isErrorWithMessage(rollbackError)
								? rollbackError.message
								: 'Unknown error'),
					);
				}
				throw error;
			} finally {
				client.release(); // Releases the client back to the pool regardless of success or failure
			}
		});
	}
}
