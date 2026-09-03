import { Module } from '@nestjs/common';
import { AddressService } from './service/address.service.js';

@Module({
  providers: [AddressService]
})
export class AddressModule {}
