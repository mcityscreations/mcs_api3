import { Controller, Get, Query } from '@nestjs/common';
import { UuidDto } from '../../../../../common/dtos/uuid.dto.js';
import { SubjectService } from '../service/subject.service.js';

@Controller('subject')
export class SubjectController {
	constructor(private readonly subjectService: SubjectService) {}

	@Get()
	async findOne(@Query() query: UuidDto) {
		const result = await this.subjectService.findOne(query.id);
		return result;
	}
}
