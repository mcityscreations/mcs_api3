import { Module } from '@nestjs/common';
import { TranslationsService } from './service/translations.service.js';
import { RepositoryService } from './repository/translations.repository.js';
import { TranslationsController } from './controller/translations.controller.js';

@Module({
  providers: [TranslationsService, RepositoryService],
  controllers: [TranslationsController]
})
export class TranslationsModule {}
