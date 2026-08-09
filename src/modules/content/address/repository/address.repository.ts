import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';
import type { IAddress } from '../schemas/address.schema.js';
import type { ISaveAddress } from '../schemas/save-address.schema.js';

@Injectable()
export class AddressRepository {
	constructor(private readonly dbService: PostgreSQLService) {}

	public async getAddressById(id: number): Promise<IAddress | null> {
		const sqlRequest = `SELECT ca.value AS address FROM content.address ca WHERE ca.id_address = $1`;
		const result: { address: IAddress }[] = await this.dbService.execute(
			sqlRequest,
			[id],
			'standard',
			false,
		);
		return result.length > 0 ? result[0].address : null;
	}

	public async getAddressByUUID(uuid: string): Promise<IAddress | null> {
		const sqlRequest = `SELECT ca.value AS address FROM content.address ca WHERE ca.id_public = $1`;
		const result: { address: IAddress }[] = await this.dbService.execute(
			sqlRequest,
			[uuid],
			'standard',
			false,
		);
		return result.length > 0 ? result[0].address : null;
	}

	public async saveAddress(payload: ISaveAddress): Promise<number | null> {
		const sqlRequest = payload.isDefault
			? `
            WITH reset_defaults AS (
                UPDATE content.address
                SET is_default = false
                WHERE id_person = $1 AND is_default = true
            )
            INSERT INTO content.address (id_person, name, value, is_default)
            VALUES ($1, $2, $3::jsonb, true)
            RETURNING id_address;
        `
			: `
            INSERT INTO content.address (id_person, name, value, is_default)
            VALUES ($1, $2, $3::jsonb, $4)
        `;

		const params = payload.isDefault
			? [payload.idPerson, payload.name, JSON.stringify(payload.address)]
			: [
					payload.idPerson,
					payload.name,
					JSON.stringify(payload.address),
					false,
				];

		const result: { id_address: number }[] = await this.dbService.execute(
			sqlRequest,
			params,
			'standard',
			false,
		);

		return result.length > 0 ? result[0].id_address : null;
	}
}
