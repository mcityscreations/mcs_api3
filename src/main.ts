import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonLoggerService } from './system/logger/logger-service/winston-logger.service';
import { WINSTON_LOGGER } from './system/logger/logger-factory/winston-logger.factory';
import { Logger } from 'winston';

async function bootstrap() {
	// 1. Starting application
	const app = await NestFactory.create(AppModule);

	// 2. Retrieving Winston Logger instance
	const winstonLoggerInstance = app.get<Logger>(WINSTON_LOGGER);

	// 3. Creating the service wrapper with the Winston Logger instance
	const winstonLoggerService = new WinstonLoggerService(winstonLoggerInstance);

	// 4. Replacing the default Logger with the custom Winston logger
	app.useLogger(winstonLoggerService);
	await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
	// Using the console logger as Winston may not be instantiated at this stage
	console.error(
		"Erreur irrécupérable lors du démarrage de l'application:",
		err,
	);
	// Exiting Node.js process
	process.exit(1);
});
