// src/modules/content/taxonomy/entities/entities.module.ts
import { Module } from '@nestjs/common';
import { EntitiesController } from './controller/entities.controller.js';
import { EntitiesService } from './services/entities.service.js';
import { EntitiesRepository } from './repository/entities.repository.js';

@Module({
	controllers: [EntitiesController],
	providers: [EntitiesService, EntitiesRepository],
})
export class EntitiesModule {}
