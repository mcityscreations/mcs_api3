import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import type { PoolClient, QueryResult } from 'pg';
import { isErrorWithMessage } from '../../../../common/validators/error.validators.js';
import {
	IDatabaseService,
	ISQLDatabaseConfig,
} from '../../database.interfaces.js';

import {
	InternalError,
	ServiceUnavailableError,
	NotFoundError,
} from '../../../errors/index.js';

export type DatabasePool = 'standard' | 'security';

@Injectable()
export class PGSQLTestService
	implements OnModuleInit, OnModuleDestroy, IDatabaseService
{
	private defaultPool!: Pool;
	private securityPool!: Pool;

	// 1. Injection propre de ConfigService via le conteneur NestJS
	constructor(private readonly configService: ConfigService) {}

	// 2. Initialisation des pools UNE FOIS que les configurations sont chargées
	public async onModuleInit() {
		this.defaultPool = new Pool(this.getStandardConfig());
		this.securityPool = new Pool(this.getSecurityConfig());

		await this.testConnection(this.defaultPool, 'Standard');
		await this.testConnection(this.securityPool, 'Security');
	}

	// N'oublie pas de fermer les pools quand NestJS s'arrête (très important pour Jest)
	public async onModuleDestroy() {
		if (this.defaultPool) await this.defaultPool.end();
		if (this.securityPool) await this.securityPool.end();
	}

	private async testConnection(pool: Pool, name: string): Promise<void> {
		let client: PoolClient | undefined;
		try {
			client = await pool.connect();
			console.log(`Pool ${name} connected.`);
		} catch (err: any) {
			const errorMessage = isErrorWithMessage(err)
				? err.message
				: 'Unknown error';
			console.error(`Pool ${name} connection ERROR: ${errorMessage}`);
		} finally {
			if (client) client.release();
		}
	}

	public getPool(dbName: DatabasePool): Pool {
		return dbName === 'security' ? this.securityPool : this.defaultPool;
	}

	public async execute<T>(
		sqlRequest: string,
		params: any[] = [],
		databasePool: DatabasePool = 'standard',
		isEmptyResultAllowed: boolean = false,
		transactionClient: PoolClient | null = null,
	): Promise<T[]> {
		const executor = transactionClient || this.getPool(databasePool);

		try {
			const result: QueryResult = await executor.query(sqlRequest, params);
			const data: T[] = result.rows as T[];

			if (data.length === 0 && !isEmptyResultAllowed) {
				throw new NotFoundError('No data matching your request.');
			}

			return data;
		} catch (error: any) {
			this.handleDatabaseError(error);
			throw error;
		}
	}

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

	private handleDatabaseError(error: any) {
		const errorCode = isPostgresError(error) ? error.code : null;
		console.error(
			`PostgreSQL Error${errorCode ? ' Code ' + errorCode : ''}: ${
				isErrorWithMessage(error) ? error.message : 'Unknown error'
			}`,
		);
		if (errorCode === '57P03' || errorCode === '53300') {
			throw new ServiceUnavailableError('Database connection limit reached.');
		}
		if (errorCode === '28P01') {
			throw new InternalError('Database access denied.');
		}
		if (errorCode === '42601') {
			throw new InternalError('SQL Syntax Error.');
		}
		if (errorCode === '23505') {
			throw new InternalError('Duplicate entry violation.');
		}
		if (errorCode === '23503') {
			throw new InternalError('Foreign key violation.');
		}
		if (errorCode === '23502') {
			throw new InternalError('Not-null constraint violation.');
		}
	}

	private getStandardConfig(): ISQLDatabaseConfig {
		const host = this.configService.get<string>('POSTGRES_STANDARD_HOST');
		const rawPort = this.configService.get<string>(
			'POSTGRES_STANDARD_PORT',
			'5432',
		);

		const user = this.configService.get<string>('POSTGRES_STANDARD_USER');
		const password = this.configService.get<string>(
			'POSTGRES_STANDARD_PASSWORD',
		);
		const database = this.configService.get<string>(
			'POSTGRES_STANDARD_DATABASE',
		);

		const port = Number.parseInt(rawPort, 10);

		if (!host || !user || !password || !database || Number.isNaN(port)) {
			console.error(
				`Configuration Error: Missing critical Postgresql credentials. Check your .env file.`,
			);
			throw new Error(
				`Configuration Error: Missing critical Postgresql credentials. Check your .env file.`,
			);
		}

		return { host, port, user, password, database };
	}

	private getSecurityConfig(): ISQLDatabaseConfig {
		const host = this.configService.get<string>('POSTGRES_SECURITY_HOST');
		const rawPort = this.configService.get<string>(
			'POSTGRES_SECURITY_PORT',
			'5432',
		);

		const user = this.configService.get<string>('POSTGRES_SECURITY_USER');
		const password = this.configService.get<string>(
			'POSTGRES_SECURITY_PASSWORD',
		);
		const database = this.configService.get<string>(
			'POSTGRES_SECURITY_DATABASE',
		);

		const port = Number.parseInt(rawPort, 10);

		if (!host || !user || !password || !database || Number.isNaN(port)) {
			console.error(
				`Configuration Error: Missing critical Postgresql credentials. Check your .env file.`,
			);
			throw new Error(
				`Configuration Error: Missing critical Postgresql credentials. Check your .env file.`,
			);
		}

		return { host, port, user, password, database };
	}
}

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
