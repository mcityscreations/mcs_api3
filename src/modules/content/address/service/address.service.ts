import { BadRequestException, Injectable } from '@nestjs/common';
import { AddressRepository } from '../repository/address.repository.js';
import { getIDType } from '../../../../common/utils/getIDType.utils.js';
import type { IAddress } from '../schemas/address.schema.js';

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
				throw new BadRequestException(
					'Unable to retrieve address : Invalid id address format',
				);

			default:
				throw new BadRequestException(
					'Unable to retrieve address : Unknown id address type',
				);
		}
	}
}
