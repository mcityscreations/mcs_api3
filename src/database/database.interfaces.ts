export interface IMariaDBConfig {
	host: string;
	port: number;
	user: string;
	password: string;
	database: string;
}

export interface MariaDbError {
	code: string;
	message: string;
	errno: number;
}
