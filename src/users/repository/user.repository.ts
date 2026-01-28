import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../database/postgresql/postgresql.service.js';
import { IUser } from '../types/user.interface.js';

@Injectable()
export class UserRepository {
	constructor(private readonly postgreSQLService: PostgreSQLService) {}

	public async getUserDetailsByUsername(username: string): Promise<IUser[]> {
		const sqlRequest = `SELECT
        u.id_public AS "idPublic",
        u.username AS "username",
        u.id_person AS "idPerson",
        u.is_active AS "isAccountActive",
		jsonb_build_object(
			'id', r.id_role,
			'title', r.title
		) AS "role",
        u.created_at AS "createdAt",
        u.updated_at AS "updatedAt"
        FROM security.user u
        JOIN security.role r ON u.id_role = r.id_role
        WHERE u.username = $1;`;
		return await this.postgreSQLService.execute<IUser>(
			sqlRequest,
			[username],
			'security',
			false,
		);
	}

	public async getUserPasswordByUsername(
		username: string,
	): Promise<{ passwordHash: string; passwordSalt: string }[]> {
		const sqlRequest = `
            SELECT 
            u.password AS "passwordHash",
            u.pass_salt AS "passwordSalt"
            FROM security.user u
            WHERE u.username = $1;`;
		return await this.postgreSQLService.execute<{
			passwordHash: string;
			passwordSalt: string;
		}>(sqlRequest, [username], 'security', false);
	}

	public async getPersonIDByUsername(
		username: string,
	): Promise<{ idPersonPublic: string }[]> {
		const sqlRequest = `
            SELECT 
            u.id_public AS "idPersonPublic"
            FROM security.user u
            WHERE u.username = $1;`;
		return await this.postgreSQLService.execute<{ idPersonPublic: string }>(
			sqlRequest,
			[username],
			'security',
			false,
		);
	}
}
