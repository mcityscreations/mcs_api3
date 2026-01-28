import { Module } from '@nestjs/common';
import { KeywordsController } from './controller/keywords.controller.js';
import { KeywordsService } from './service/keywords.service.js';
import { KeywordsRepository } from './repository/keywords.repository.js';

@Module({
	controllers: [KeywordsController],
	providers: [KeywordsService, KeywordsRepository],
})
export class KeywordsModule {}
