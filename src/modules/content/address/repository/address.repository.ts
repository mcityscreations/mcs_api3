import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';
import type { IAddress } from '../schemas/address.schema.js';
import type { ISaveAddress } from '../schemas/save-address.schema.js';

@Injectable()
export class AddressRepository {
	constructor(private readonly dbService: PostgreSQLService) {}

	public async getAddressById(id: number): Promise<IAddress | null> {
		const sqlRequest = `SELECT
		ca.id_public AS id,
		ca.name AS name,
		ca.system_source AS "systemSource",
		ca.id_source AS "idSource",
		ca.value AS value,
		ca.is_default AS "isDefault",
		ca.is_billing_address AS "isBillingAddress"
		FROM content.address ca WHERE ca.id_address = $1`;
		const result = await this.dbService.execute<IAddress>(
			sqlRequest,
			[id],
			'standard',
		);
		return result.length > 0 ? result[0] : null;
	}

	public async getAddressByUUID(uuid: string): Promise<IAddress | null> {
		const sqlRequest = `SELECT
		ca.id_public AS id,
		ca.name AS name,
		ca.system_source AS "systemSource",
		ca.id_source AS "idSource",
		ca.value AS value,
		ca.is_default AS "isDefault",
		ca.is_billing_address AS "isBillingAddress"
		FROM content.address ca WHERE ca.id_public = $1`;
		const result = await this.dbService.execute<IAddress>(
			sqlRequest,
			[uuid],
			'standard',
		);
		return result.length > 0 ? result[0] : null;
	}

	public async saveAddress(payload: ISaveAddress): Promise<string | null> {
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
			INSERT INTO content.address (id_person, name, value, is_default, is_billing_address, system_source, id_source)
			SELECT id_person, $2, $3::jsonb, $4, $5, $6, $7
			FROM target_person
			ON CONFLICT (system_source, id_source) DO UPDATE SET
				name = EXCLUDED.name,
				value = EXCLUDED.value,
				is_default = EXCLUDED.is_default,
				is_billing_address = EXCLUDED.is_billing_address,
				updated_at = NOW()
			RETURNING id_public AS "idPublic";
		`
			: `
			INSERT INTO content.address (id_person, name, value, is_default, is_billing_address, system_source, id_source)
			SELECT id_person, $2, $3::jsonb, $4, $5, $6, $7
			FROM content.people
			WHERE id_public = $1
			ON CONFLICT (system_source, id_source) DO UPDATE SET
				name = EXCLUDED.name,
				value = EXCLUDED.value,
				is_default = EXCLUDED.is_default,
				is_billing_address = EXCLUDED.is_billing_address,
				updated_at = NOW()
			RETURNING id_public AS "idPublic";
		`;

		const params = payload.isDefault
			? [
					payload.idPerson,
					payload.name,
					JSON.stringify(payload.address),
					true,
					payload.isBillingAddress,
					payload.systemSource,
					payload.idSource,
				]
			: [
					payload.idPerson,
					payload.name,
					JSON.stringify(payload.address),
					false,
					payload.isBillingAddress,
					payload.systemSource,
					payload.idSource,
				];

		const result = await this.dbService.execute<{ idPublic: string }>(
			sqlRequest,
			params,
			'standard',
		);

		return result.length > 0 ? result[0].idPublic : null;
	}

	public async deleteAddressById(id: string): Promise<void> {
		const sqlRequest = `DELETE FROM content.address WHERE id_public = $1`;
		await this.dbService.execute(sqlRequest, [id], 'standard');
	}

	public async getAddressBySystemSource(payload: {
		systemSource: string;
		idSource: string;
	}): Promise<IAddress | null> {
		const sqlRequest = `SELECT
		ca.id_public AS id,
		ca.name AS name,
		ca.system_source AS "systemSource",
		ca.id_source AS "idSource",
		ca.value AS value,
		ca.is_default AS "isDefault",
		ca.is_billing_address AS "isBillingAddress"
		FROM content.address ca WHERE ca.system_source = $1 AND ca.id_source = $2`;
		const result = await this.dbService.execute<IAddress>(
			sqlRequest,
			[payload.systemSource, payload.idSource],
			'standard',
		);
		return result && result.length > 0 ? result[0] : null;
	}

	public async getAddressIDsBySystemSource(payload: {
		systemSource: string;
		idSource: string;
	}): Promise<{ idPrivate: number; idPublic: string } | null> {
		const sqlRequest = `SELECT
		id_address AS "idPrivate",
		id_public AS "idPublic"
		FROM content.address
		WHERE system_source = $1 AND id_source = $2`;
		const result = await this.dbService.execute<{
			idPrivate: number;
			idPublic: string;
		}>(sqlRequest, [payload.systemSource, payload.idSource], 'standard');
		return result.length > 0 ? result[0] : null;
	}
}
