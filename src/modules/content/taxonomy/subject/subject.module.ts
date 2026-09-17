import { Module } from '@nestjs/common';
import { SubjectService } from './service/subject.service.js';
import { SubjectController } from './controller/subject.controller.js';
import { SubjectRepository } from './repository/subject.repository.js';

@Module({
	providers: [SubjectService, SubjectRepository],
	controllers: [SubjectController],
})
export class SubjectModule {}
