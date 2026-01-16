// src/database/database.interfaces.ts
export abstract class IDatabaseService {
	abstract onModuleInit(): Promise<void>;
	abstract execute<T>(
		sqlRequest: string,
		params?: any[],
		requiredDatabase?: string,
		isEmptyResultAllowed?: boolean,
		transactionClient?: any,
	): Promise<T[]>;
	abstract beginTransaction(requiredDatabase?: string): Promise<any>;
	abstract commit(transactionClient: any): Promise<void>;
	abstract rollback(transactionClient: any): Promise<void>;
}
export interface ISQLDatabaseConfig {
	host: string;
	port: number;
	user: string;
	password: string;
	database: string;
}

export interface IMariaDbError {
	code: string;
	message: string;
	errno: number;
}

export interface ITypeOrmDatasourceConfig {
	type: 'mariadb' | 'postgres';
	host: string;
	port: number;
	username: string;
	password: string;
	database: string;
	entities: any[];
	autoLoadEntities: boolean;
	synchronize: boolean;
	logging: boolean;
}
