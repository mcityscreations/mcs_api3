import { Module } from '@nestjs/common';
import { ArtworksService } from './services/artworks/artworks.service.js';
import { ArtworksRepository } from './repository/artworks.repository.js';
import { ArtworksController } from './controller/artworks.controller.js';
import { TechniquesModule } from '../taxonomy/techniques/techniques.module.js';
import { CategoriesModule } from '../taxonomy/categories/categories.module.js';
import { SubjectModule } from '../taxonomy/subject/subject.module.js';
import { LanguagesModule } from '../taxonomy/languages/languages.module.js';
import { KeywordsModule } from '../taxonomy/keywords/keywords.module.js';
import { TransactionManager } from '../../../system/database/postgresql/transactions/transaction-manager.service.js';
import { SecurityModule } from '../../security/security.module.js';
import { ArtistModule } from '../artist/artist.module.js';
import { UsersModule } from '../../identity/users/users.module.js';

@Module({
	providers: [ArtworksService, ArtworksRepository, TransactionManager],
	controllers: [ArtworksController],
	imports: [
		TechniquesModule,
		CategoriesModule,
		SubjectModule,
		LanguagesModule,
		KeywordsModule,
		SecurityModule,
		ArtistModule,
		UsersModule,
	],
})
export class ArtworksModule {}
