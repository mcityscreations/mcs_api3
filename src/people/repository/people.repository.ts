import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../database/postgresql/postgresql.service.js';
import { IPersonBase } from '../types/person.interface.js';

@Injectable()
export class PeopleRepository {
	constructor(private readonly dbService: PostgreSQLService) {}

	async findOne(id: string): Promise<IPersonBase | null> {
		const sqlRequest = `SELECT * FROM content.v_people WHERE id = $1;`;
		const data: IPersonBase[] = await this.dbService.execute(
			sqlRequest,
			[id],
			'standard',
			true,
		);
		const result = data && data.length > 0 ? data[0] : null;
		return result;
	}
}
