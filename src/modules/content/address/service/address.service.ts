import { Injectable } from '@nestjs/common';
import {
	InternalError,
	BadRequestError,
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
			case 'private':
				return await this.addressRepository.getAddressById(idAddress as number);
			case 'public':
				return await this.addressRepository.getAddressByUUID(
					idAddress as string,
				);
			case 'invalid':
				throw new BadRequestError(
					'Unable to retrieve address : Invalid id address format',
				);

			default:
				throw new BadRequestError(
					'Unable to retrieve address : Unknown id address type',
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
		if (!addressIDs)
			throw new InternalError(
				`Unable to save address :` + JSON.stringify(payload),
			);
		return addressIDs;
	}
}
