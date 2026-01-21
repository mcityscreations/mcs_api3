import { Module } from '@nestjs/common';
import { ContactModule } from '../contact/contact.module';
import { PeopleService } from './people.service';
import { PeopleController } from './people.controller';
import { PeopleRepository } from './repository/people.repository';

@Module({
	imports: [ContactModule],
	controllers: [PeopleController],
	providers: [PeopleService, PeopleRepository],
	exports: [PeopleService],
})
export class PeopleModule {}
