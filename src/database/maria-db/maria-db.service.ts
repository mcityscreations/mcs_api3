// src/database/mariadb.service.ts
import {
	Injectable,
	Inject,
	InternalServerErrorException,
	NotFoundException,
	OnModuleInit,
	ServiceUnavailableException,
} from '@nestjs/common';
import * as mariadb from 'mariadb';
import { Pool, PoolConnection } from 'mariadb';
import type {
	ISQLDatabaseConfig,
	IMariaDbError,
	IDatabaseService,
} from '../database.interfaces';
import { isErrorWithMessage } from '../../common/types/error.types';
import { WinstonLoggerService } from 'src/system/logger/logger-service/winston-logger.service';
import { isNestHttpException } from '../../common/types/error.types';

// --- Types ---

// Two possible database pools
export type DatabasePool = 'standard' | 'oauth';

// --- MariaDBService ---

@Injectable()
export class MariaDBService implements OnModuleInit, IDatabaseService {
	// Singleton pools stored as private members
	private readonly defaultPool: Pool;
	private readonly securityPool: Pool;

	// Injecting configuration service to get credentials
	constructor(
		@Inject('STANDARD_DB_CONFIG')
		private readonly standardConfig: ISQLDatabaseConfig,
		@Inject('OAUTH_DB_CONFIG')
		private readonly securityConfig: ISQLDatabaseConfig,
		private readonly logger: WinstonLoggerService,
	) {
		// Initializing connexion pools
		this.defaultPool = mariadb.createPool(this.standardConfig);
		this.securityPool = mariadb.createPool(this.securityConfig);

		this.logger.log('MariaDBService initialized with 2 pools.');
	}

	/** Async method called once module is initialized */
	public async onModuleInit() {
		this.logger.log('--- Checking MariaDB connections ---');
		await this.testConnection(this.defaultPool, 'Standard');
		await this.testConnection(this.securityPool, 'OAuth');
		this.logger.log('--- Checked ---');
	}

	/** Tests the connection of a given pool */
	private async testConnection(
		pool: mariadb.Pool,
		name: string,
	): Promise<void> {
		let conn: mariadb.PoolConnection | undefined;
		try {
			// Getting pool connection
			conn = await pool.getConnection();
			this.logger.log(`Pool ${name} connected.`);
		} catch (err: any) {
			const errorMessage = isErrorWithMessage(err);
			this.logger.error(`Pool ${name} connection ERROR: ${errorMessage}`);
			this.logger.error(`Pool ${name} ERROR:`, getErrorMessage(err));
		} finally {
			// Release the connection
			if (conn) {
				await conn.release();
			}
		}
	}

	/** Returns the appropriate pool connection */
	private getPool(dbName: DatabasePool): Pool {
		if (dbName === 'oauth') {
			return this.securityPool;
		}
		return this.defaultPool; // Defaults to 'standard'
	}

	// --- Main method to execute requests ---

	/**
	 * Executes an SQL requset.
	 * @param sqlRequest The request as a string.
	 * @param params Request's params.
	 * @param requiredDatabase 'standard' or 'oauth'.
	 * @param isEmptyResultAllowed If set to true, an empty result corresponds to a 204 httpCode (not 404).
	 * @param transactionConnection Optional connection in case of a transaction.
	 * @returns Promise<Array<any>> The results of the request.
	 */
	public async execute<T>(
		sqlRequest: string,
		params: any[] = [],
		databasePool: DatabasePool = 'standard',
		isEmptyResultAllowed: boolean = false,
		transactionConnection: PoolConnection | null = null,
	): Promise<T[]> {
		const useExistingConnection = !!transactionConnection;
		const poolOrConnection = useExistingConnection
			? transactionConnection
			: this.getPool(databasePool);

		if (!poolOrConnection) {
			this.logger.error('Database pool not initialized.');
			throw new InternalServerErrorException('Database pool not initialized.');
		}

		let conn: PoolConnection | undefined;

		try {
			// If using existing connection (transaction), use it
			// Otherwise, get a new connection from the pool
			if (useExistingConnection) {
				conn = poolOrConnection as PoolConnection;
			} else {
				conn = await (poolOrConnection as Pool).getConnection();
			}

			// Execute the SQL request
			const results: T[] = (await conn.query(
				sqlRequest,
				params,
			)) as unknown as T[];

			// If empty results are not allowed, throw a 404 error
			if (
				Array.isArray(results) &&
				results.length === 0 &&
				!isEmptyResultAllowed
			) {
				throw new NotFoundException('No data matching your request.');
			}

			return results;
		} catch (error: any) {
			// --- 1. Handling errors from the database (SQL) ---
			if (isMariaDbError(error)) {
				if (error.code === 'ER_TOO_MANY_USER_CONNECTIONS') {
					this.logger.error(
						'Database connection limit reached:',
						error.message,
					);
					throw new ServiceUnavailableException(
						'Too many requests, try again later.',
					);
				}
				if (error.code === 'ER_ACCESS_DENIED_ERROR') {
					this.logger.error('Database access denied:', error.message);
					throw new InternalServerErrorException('Database access denied.');
				}
			}

			// --- 2. Handling Nestjs Exceptions ---
			if (isNestHttpException(error)) {
				const status = error.getStatus();

				if (status >= 400) {
					throw error; // Throw known HttpExceptions as is
				}
			}

			// --- 3. Handling unclassified errors (500) ---

			// Trying to extract a meaningful message
			const errorMessage: string = getErrorMessage(error);
			this.logger.error(`Database request error: ${errorMessage}`);
			throw new InternalServerErrorException(
				'Database query failed or connection error.',
				errorMessage,
			);
		} finally {
			// Realeasing the connection only if it was created here
			// Does not apply to transaction connections
			if (conn && !useExistingConnection) {
				await conn.release();
			}
		}
	}

	// --- Transaction Methods ---

	/** Starts a new transaction et returns the associated connection */
	public async beginTransaction(
		requiredDatabase: DatabasePool = 'standard',
	): Promise<PoolConnection> {
		const pool = this.getPool(requiredDatabase);
		if (!pool) {
			throw new InternalServerErrorException('Database pool not initialized.');
		}

		let connection: PoolConnection | undefined;

		try {
			// Getting a new connection from the pool
			connection = await pool.getConnection();

			// Starting a transaction
			await connection.beginTransaction();

			// Returning the connection with the active transaction
			return connection;
		} catch (err) {
			// Releasing the connection in case of error during beginTransaction
			if (connection) {
				await connection.release();
			}

			// Error handling
			const errorMessage = getErrorMessage(err);
			this.logger.error('Error starting transaction:', errorMessage);
			throw new ServiceUnavailableException(
				`Unable to get connection or start transaction. Details: ${err} || 'Unknown reason'`,
			);
		}
	}

	/** Commits an active transaction and releases its associated connection */
	async commit(connection: PoolConnection): Promise<void> {
		if (!connection) {
			throw new InternalServerErrorException(
				'No connection provided to commit.',
			);
		}
		try {
			await connection.commit();
		} catch (err: any) {
			throw new InternalServerErrorException(
				`Failed to commit transaction. Details: ${err}`,
			);
		} finally {
			await connection.release();
		}
	}

	/** Transaction canceling (rollback) and connection release. */
	async rollback(connection: PoolConnection): Promise<void> {
		if (!connection) {
			return; // Do not throw error if no connection provided
		}
		try {
			await connection.rollback();
		} catch (err: unknown) {
			// Logging the error but no throwing (The rollback must not cause the parent operation to fail.)
			const error = getErrorMessage(err);
			this.logger.error('Failed to rollback transaction:', error);
		} finally {
			await connection.release();
		}
	}
}

// --- Types Guards ---

/** Type guard function for MariaDB errors */
function isMariaDbError(error: any): error is IMariaDbError {
	return (
		typeof error === 'object' &&
		error !== null &&
		typeof (error as IMariaDbError).code === 'string' &&
		typeof (error as IMariaDbError).errno === 'number'
	);
}

function getErrorMessage(error: unknown): string {
	// Checking if the error is an object with a 'message' property of type string
	if (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof (error as { message: unknown }).message === 'string'
	) {
		// Returning the message after type assertion
		return (error as { message: string }).message;
	}
	// If the error is a string, return it directly
	if (typeof error === 'string') {
		return error;
	}

	return 'Unknown database error.';
}
