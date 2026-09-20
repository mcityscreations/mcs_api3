// src/database/postgresql/postgresql.service.ts
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import type { PoolClient, QueryResult, PoolConfig } from 'pg';
import { isErrorWithMessage } from '../../../common/validators/error.validators.js';
import { WinstonLoggerService } from '../../logger/logger-service/winston-logger.service.js';
import { IDatabaseService } from '../database.interfaces.js';
import { InternalError, ServiceUnavailableError } from '../../errors/index.js';

export type DatabasePool = 'standard' | 'security';

@Injectable()
export class PostgreSQLService implements OnModuleInit, IDatabaseService {
	private readonly defaultPool: Pool;
	private readonly securityPool: Pool;

	constructor(
		@Inject('PG_STANDARD_CONFIG') private readonly standardConfig: PoolConfig,
		@Inject('PG_SECURITY_CONFIG') private readonly securityConfig: PoolConfig,
		private readonly logger: WinstonLoggerService,
	) {
		this.defaultPool = new Pool(this.standardConfig);
		this.securityPool = new Pool(this.securityConfig);
		this.logger.log('PostgreSQLService initialized with 2 pools.');
	}

	public async onModuleInit() {
		await this.testConnection(this.defaultPool, 'Standard');
		await this.testConnection(this.securityPool, 'Security');
	}

	private async testConnection(pool: Pool, name: string): Promise<void> {
		let client: PoolClient | undefined;
		try {
			client = await pool.connect();
			this.logger.log(`Pool ${name} connected.`);
		} catch (err: any) {
			const errorMessage = isErrorWithMessage(err)
				? err.message
				: 'Unknown error';
			this.logger.error(`Pool ${name} connection ERROR: ${errorMessage}`);
		} finally {
			if (client) client.release();
		}
	}

	private getPool(dbName: DatabasePool): Pool {
		return dbName === 'security' ? this.securityPool : this.defaultPool;
	}

	/**
	 * Executes SQL requests against the PostgreSQL database.
	 *
	 * @param sqlRequest - The SQL query string to be executed.
	 * @param params - An array of parameters to be used in the SQL query.
	 * @param databasePool - The database pool to use ('standard' or 'security').
	 * @param transactionClient - Optional PoolClient for transaction context.
	 * @returns A promise that resolves to an array of results of type T.
	 */
	public async execute<T>(
		sqlRequest: string,
		params: any[] = [],
		databasePool: DatabasePool = 'standard',
		transactionClient: PoolClient | null = null,
	): Promise<T[]> {
		const executor = transactionClient || this.getPool(databasePool);
		try {
			const result: QueryResult = await executor.query(sqlRequest, params);
			return result.rows as T[];
		} catch (error: any) {
			throw this.handleDatabaseError(error);
		}
	}

	// --- Transaction Management ---

	public async beginTransaction(
		requiredDatabase: DatabasePool = 'standard',
	): Promise<PoolClient> {
		const pool = this.getPool(requiredDatabase);
		const client = await pool.connect();
		try {
			await client.query('BEGIN');
			return client;
		} catch (err) {
			client.release();
			const errorMessage = isErrorWithMessage(err)
				? err.message
				: 'Unknown error';
			throw new ServiceUnavailableError(
				'Unable to start transaction ' + errorMessage,
			);
		}
	}

	public async commit(client: PoolClient): Promise<void> {
		try {
			await client.query('COMMIT');
		} finally {
			client.release();
		}
	}

	public async rollback(client: PoolClient): Promise<void> {
		try {
			await client.query('ROLLBACK');
		} finally {
			client.release();
		}
	}

	private handleDatabaseError(error: any): Error {
		const errorCode = isPostgresError(error) ? error.code : null;
		this.logger.error(
			`PostgreSQL Error${errorCode ? ' Code ' + errorCode : ''}: ${
				isErrorWithMessage(error) ? error.message : 'Unknown error'
			}`,
		);

		if (errorCode === '57P03' || errorCode === '53300') {
			return new ServiceUnavailableError('Database connection limit reached.');
		}
		if (errorCode === '28P01') {
			return new InternalError('Database access denied.');
		}
		if (errorCode === '42601') {
			return new InternalError('SQL Syntax Error.');
		}
		if (errorCode === '23505') {
			return new InternalError('Duplicate entry violation.');
		}
		if (errorCode === '23503') {
			return new InternalError('Foreign key violation.');
		}
		if (errorCode === '23502') {
			return new InternalError('Not-null constraint violation.');
		}

		// If the error code is not recognized, return a generic internal error
		return new InternalError(
			'Database error occurred.' +
				(isErrorWithMessage(error) ? ' ' + error.message : ''),
		);
	}
}

// Helpers

function isPostgresError(
	error: any,
): error is { code: string; message: string } {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		'message' in error &&
		typeof (error as Record<string, unknown>).message === 'string' &&
		typeof (error as Record<string, unknown>).code === 'string'
	);
}
