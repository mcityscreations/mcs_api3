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
import { CommonModule } from './common/common.module.js';
import { ContentModule } from './modules/content/content.module.js';
import { StoresModule } from './modules/stores/stores.module.js';
import { AccountingModule } from './modules/accounting/accounting.module.js';

const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: envFile,
		}),
		ScheduleModule.forRoot(),
		SystemModule,
		CommonModule,
		ContentModule,
		StoresModule,
		AccountingModule,
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
