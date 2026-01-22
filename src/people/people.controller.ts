import { Controller, Get, Param } from '@nestjs/common';
import { PeopleService } from './people.service';

@Controller('people')
export class PeopleController {
	constructor(private readonly peopleService: PeopleService) {}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.peopleService.findOne(id);
	}
}
