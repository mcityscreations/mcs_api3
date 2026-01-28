import {
	Module,
	NestModule,
	MiddlewareConsumer,
	RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// Middlewares
import { CorrelationIdMiddleware } from './system/middlewares/correlation-id.middleware.js';

// Application modules
import { SystemModule } from './system/system.module.js';
import { SecurityModule } from './security/security.module.js';
import { DatabaseModule } from './database/database.module.js';
import { WeatherModule } from './weather/weather.module.js';
import { CommonModule } from './common/common.module.js';
import { ContactModule } from './contact/contact.module.js';
import { PeopleModule } from './people/people.module.js';
import { UsersModule } from './users/users.module.js';
import { RolesModule } from './roles/roles.module.js';
import { PrestashopModule } from './prestashop/prestashop.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { TechniquesModule } from './techniques/techniques.module.js';
import { EntitiesModule } from './entities/entities.module.js';
import { TranslationsModule } from './translations/translations.module';
import { KeywordsModule } from './taxonomy/keywords/keywords.module';

const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: envFile,
		}),
		ScheduleModule.forRoot(),
		SystemModule,
		DatabaseModule,
		SecurityModule,
		WeatherModule,
		CommonModule,
		UsersModule,
		PeopleModule,
		ContactModule,
		RolesModule,
		PrestashopModule,
		CategoriesModule,
		TechniquesModule,
		EntitiesModule,
		TranslationsModule,
		KeywordsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(CorrelationIdMiddleware)
			.forRoutes({ path: '*', method: RequestMethod.ALL });
	}
}
