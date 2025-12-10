import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { SystemModule } from './system/system.module';
import { SecurityModule } from './security/security.module';
import { DatabaseModule } from './database/database.module';
import { WeatherModule } from './weather/weather.module';
import { CommonModule } from './common/common.module';

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
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
