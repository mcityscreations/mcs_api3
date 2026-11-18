// src/modules/content/people/people.module.ts
import { Module } from '@nestjs/common';
import { ContactModule } from '../contact/contact.module.js';
import { CountryModule } from '../taxonomy/country/country.module.js';
import { PeopleService } from './people.service.js';
import { PeopleController } from './people.controller.js';
import { PeopleRepository } from './repository/people.repository.js';

@Module({
	imports: [ContactModule, CountryModule],
	controllers: [PeopleController],
	providers: [PeopleService, PeopleRepository],
	exports: [PeopleService],
})
export class PeopleModule {}
