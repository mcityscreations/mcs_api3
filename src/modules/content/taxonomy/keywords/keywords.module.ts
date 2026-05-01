import { Module } from '@nestjs/common';
import { KeywordsController } from './controller/keywords.controller.js';
import { KeywordsService } from './service/keywords.service.js';
import { KeywordsRepository } from './repository/keywords.repository.js';
import { SystemModule } from '../../../../system/system.module.js';
import { SecurityModule } from '../../../security/security.module.js';

@Module({
	imports: [SystemModule, SecurityModule],
	controllers: [KeywordsController],
	providers: [KeywordsService, KeywordsRepository],
	
})
export class KeywordsModule {}
