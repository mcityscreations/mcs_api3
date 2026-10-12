import { Module } from '@nestjs/common';
import { TechniquesService } from './techniques.service.js';
import { TechniquesRepository } from './techniques.repository.js';
import { TechniquesController } from './techniques.controller.js';

@Module({
	controllers: [TechniquesController],
	providers: [TechniquesService, TechniquesRepository],
	exports: [TechniquesService],
})
export class TechniquesModule {}
