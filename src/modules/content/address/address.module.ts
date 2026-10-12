import { Module } from '@nestjs/common';
import { AddressService } from './service/address.service.js';
import { AddressRepository } from './repository/address.repository.js';

@Module({
	providers: [AddressService, AddressRepository],
	exports: [AddressService],
})
export class AddressModule {}
