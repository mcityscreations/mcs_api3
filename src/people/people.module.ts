import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactModule } from '../contact/contact.module';
import { Person } from './entities/person.entity';
import { PersonDetail } from './entities/person-detail.entity';
import { PeopleService } from './people.service';
import { PeopleController } from './people.controller';

@Module({
	imports: [
		TypeOrmModule.forFeature([Person, PersonDetail]),
		ContactModule, // 💡 Importation pour la résolution de la relation Person->Contact
	],
	controllers: [PeopleController],
	providers: [PeopleService],
	exports: [TypeOrmModule.forFeature([Person, PersonDetail])],
})
export class PeopleModule {}
