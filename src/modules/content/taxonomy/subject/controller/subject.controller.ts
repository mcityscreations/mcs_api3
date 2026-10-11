import { Controller, Get, Param, Query } from '@nestjs/common';
import { UuidDto } from '../../../../../common/dtos/uuid.dto.js';
import { LanguageQueryDto } from '../../../../common/dtos/language.dto.js';
import { SubjectService } from '../service/subject.service.js';
import { LanguageQueryDto } from '../../../../../common/dtos/language.dto.js';

@Controller('taxonomy/subjects')
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
	async findAll(@Query() query: LanguageQueryDto) {
		const lang = query.lang ?? null;
		return lang
			? this.subjectService.findAlli18n(lang)
			: this.subjectService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: UuidDto, @Query() query: LanguageQueryDto) {
		const lang = query.lang ?? null;
		return lang
			? this.subjectService.findOnei18n(id.id, lang)
			: this.subjectService.findOne(id.id);
	}

}
