import {
	Module,
	NestModule,
	MiddlewareConsumer,
	RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// Middlewares
import { CorrelationIdMiddleware } from './system/middlewares/correlation-id.middleware';

// Application modules
import { SystemModule } from './system/system.module';
import { SecurityModule } from './security/security.module';
import { DatabaseModule } from './database/database.module';
import { WeatherModule } from './weather/weather.module';
import { CommonModule } from './common/common.module';
import { ContactModule } from './contact/contact.module';
import { PeopleModule } from './people/people.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PrestashopModule } from './prestashop/prestashop.module';
import { CategoriesModule } from './categories/categories.module';
import { TechniquesModule } from './techniques/techniques.module';

const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: envFile,
		}),
		ScheduleModule.forRoot(),
		SystemModule,
		SecurityModule,
		DatabaseModule,
		WeatherModule,
		CommonModule,
		UsersModule,
		PeopleModule,
		ContactModule,
		RolesModule,
		PrestashopModule,
		CategoriesModule,
		TechniquesModule,
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
