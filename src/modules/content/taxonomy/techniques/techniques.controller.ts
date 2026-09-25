// src/modules/content/taxonomy/techniques/techniques.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { TechniquesService } from './techniques.service.js';
@Controller('taxonomy/techniques')
export class TechniquesController {
	constructor(private readonly techniquesService: TechniquesService) {}
	/*
	@Post()
	create(@Body() createTechniqueDto: CreateTechniqueDto) {
		return this.techniquesService.create(createTechniqueDto);
	}
*/
	@Get()
	findAll() {
		return this.techniquesService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.techniquesService.findOne(id);
	}
	/*
	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateTechniqueDto: UpdateTechniqueDto,
	) {
		return this.techniquesService.update(id, updateTechniqueDto);
	}
		*/
}
