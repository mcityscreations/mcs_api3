import { Module } from '@nestjs/common';
import { CountryController } from './controller/country.controller.js';
import { CountryService } from './service/country.service.js';
import { CountryRepository } from './repository/country.repository.js';

@Module({
	controllers: [CountryController],
	providers: [CountryService, CountryRepository],
})
export class CountryModule {}
