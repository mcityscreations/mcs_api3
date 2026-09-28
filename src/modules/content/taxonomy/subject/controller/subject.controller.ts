import { Controller, Get, Query } from '@nestjs/common';
import { UuidDto } from '../../../../../common/dtos/uuid.dto.js';
import { LanguageQueryDto } from '../../../../common/dtos/language.dto.js';
import { SubjectService } from '../service/subject.service.js';

@Controller('subject')
export class SubjectController {
	constructor(private readonly subjectService: SubjectService) {}

	@Get(':id')
	public async findOne(@Param('id') id: UuidDto, @Query() query: LanguageQueryDto) {
		const lang = query.lang ?? null;
		return lang
			? this.subjectService.findAlli18n(lang)
			: this.subjectService.findAll();
	}

	@Get()
	public async findAll(@Query() query: LanguageQueryDto) {
		const lang = query.lang ?? null;
		return lang
			? this.subjectService.findAlli18n(lang)
			: this.subjectService.findAll();
	}

}
