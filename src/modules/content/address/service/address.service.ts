import { Injectable } from '@nestjs/common';
import {
	InternalError,
	BadRequestError,
	NotFoundError,
} from '../../../../system/errors/index.js';
import { AddressRepository } from '../repository/address.repository.js';
import { getIDType } from '../../../../common/utils/getIDType.utils.js';
import type { IAddress } from '../schemas/address.schema.js';
import {
	SaveAddressSchema,
	type ISaveAddress,
} from '../schemas/save-address.schema.js';
import { ValidationError } from '../../../../system/errors/index.js';

@Injectable()
export class AddressService {
	constructor(private readonly addressRepository: AddressRepository) {}

	public async getAddressByID(
		idAddress: number | string,
	): Promise<IAddress | null> {
		switch (getIDType(idAddress)) {
			case 'private': {
				const result = await this.addressRepository.getAddressById(
					idAddress as number,
				);
				if (!result) {
					throw new NotFoundError(
						`[Address Service] Unable to retrieve address : Address with id ${idAddress} not found`,
					);
				}
				return result;
			}
			case 'public': {
				const result = await this.addressRepository.getAddressByUUID(
					idAddress as string,
				);
				if (!result) {
					throw new NotFoundError(
						`[Address Service] Unable to retrieve address : Address with id ${idAddress} not found`,
					);
				}
				return result;
			}
			case 'invalid':
				throw new BadRequestError(
					'[Address Service] Unable to retrieve address : Invalid id address format',
				);

			default:
				throw new BadRequestError(
					'[Address Service] Unable to retrieve address : Unknown id address type',
				);
		}
	}

	public async saveAddress(
		payload: ISaveAddress,
	): Promise<{ idPrivate: number; idPublic: string } | null> {
		const parsedPayload = SaveAddressSchema.safeParse(payload);
		if (!parsedPayload.success)
			throw new ValidationError(`Invalid payload : ${parsedPayload.error}`);
		const addressIDs = await this.addressRepository.saveAddress(payload);
		const fallBackIDs = addressIDs
			? addressIDs
			: await this.getAddressIDsBySystemSource({
					systemSource: parsedPayload.data.systemSource!,
					idSource: parsedPayload.data.idSource!,
				});
		if (!fallBackIDs) {
			throw new InternalError(
				`Unable to save address :` + JSON.stringify(payload),
			);
		}
		return fallBackIDs;
	}

	public async getAddressIDsBySystemSource(payload: {
		systemSource: string;
		idSource: string;
	}): Promise<{ idPrivate: number; idPublic: string } | null> {
		if (
			!payload.systemSource ||
			!payload.idSource ||
			payload.systemSource.trim() === '' ||
			payload.idSource.trim() === ''
		) {
			throw new BadRequestError(
				`[Address Service] Unable to retrieve address : Missing system source or id source`,
			);
		}
		const result =
			await this.addressRepository.getAddressIDsBySystemSource(payload);
		if (!result) {
			throw new NotFoundError(
				`[Address Service] Unable to retrieve address : Address with system source ${payload.systemSource} and id source ${payload.idSource} not found`,
			);
		}
		return result;
	}
}
