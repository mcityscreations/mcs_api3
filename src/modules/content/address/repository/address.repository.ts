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

	public async saveAddress(
		payload: ISaveAddress,
	): Promise<{ idPrivate: number; idPublic: string } | null> {
		const sqlRequest = payload.isDefault
			? `
        WITH target_person AS (
            SELECT id_person FROM content.people WHERE id_public = $1
        ),
        reset_defaults AS (
            UPDATE content.address
            SET is_default = false
            WHERE id_person = (SELECT id_person FROM target_person) 
              AND is_default = true
        )
        INSERT INTO content.address (id_person, name, value, is_default)
        SELECT id_person, $2, $3::jsonb, true
        FROM target_person
        RETURNING id_address AS "idPrivate", id_public AS "idPublic";
    `
			: `
        INSERT INTO content.address (id_person, name, value, is_default)
        SELECT id_person, $2, $3::jsonb, $4
        FROM content.people
        WHERE id_public = $1
        RETURNING id_address AS "idPrivate", id_public AS "idPublic";
    `;

		const params = payload.isDefault
			? [payload.idPerson, payload.name, JSON.stringify(payload.address)]
			: [
					payload.idPerson,
					payload.name,
					JSON.stringify(payload.address),
					false,
				];

		const result: { idPrivate: number; idPublic: string }[] =
			await this.dbService.execute(sqlRequest, params, 'standard', false);

		return result.length > 0 ? result[0] : null;
	}
}
