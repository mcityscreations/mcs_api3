import { Module } from '@nestjs/common';
import { TechniquesService } from './techniques.service.js';
import { TechniquesController } from './techniques.controller.js';

@Module({
	controllers: [TechniquesController],
	providers: [TechniquesService],
	exports: [TechniquesService],
})
export class TechniquesModule {}
