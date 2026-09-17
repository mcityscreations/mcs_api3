import { Module } from '@nestjs/common';
import { KeywordsController } from './controller/keywords.controller.js';
import { KeywordsService } from './service/keywords.service.js';
import { KeywordsRepository } from './repository/keywords.repository.js';
import { SecurityModule } from '../../../security/security.module.js';

@Module({
	imports: [SecurityModule],
	controllers: [KeywordsController],
	providers: [KeywordsService, KeywordsRepository],
	exports: [KeywordsService],
})
export class KeywordsModule {}
