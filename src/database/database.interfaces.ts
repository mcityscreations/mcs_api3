// src/database/database.interfaces.ts
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
