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
import { DatabaseModule } from './system/database/database.module.js';
import { CommonModule } from './common/common.module.js';
import { UsersModule } from './modules/identity/users/users.module.js';
import { RolesModule } from './modules/identity/roles/roles.module.js';
import { ContentModule } from './modules/content/content.module.js';

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
		SystemModule,
		CommonModule,
		UsersModule,
		RolesModule,
		ContentModule,
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
