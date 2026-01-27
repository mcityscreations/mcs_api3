import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import helmet from 'helmet';
import { ZodValidationPipe } from 'nestjs-zod';
import { WinstonLoggerService } from './system/logger/logger-service/winston-logger.service.js';

async function bootstrap() {
	// 1. Starting application
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true, // Keeps logs in buffer until a logger is set
	});

	// 2. Applying security middleware
	app.use(helmet());

	// 3. Retrieving Winston Logger instance
	const winstonLoggerService = app.get(WinstonLoggerService);

	// 4. Replacing the default Logger with the custom Winston logger
	app.useLogger(winstonLoggerService);

	// 5. Applying Zod validation pipe globally
	app.useGlobalPipes(new ZodValidationPipe());

	await app.listen(process.env.PORT ?? 3000);
}
try {
	await bootstrap();
} catch (error) {
	// Using the console logger as Winston may not be instantiated at this stage
	console.error(
		"Erreur irrécupérable lors du démarrage de l'application:",
		error,
	);
	// Exiting Node.js process
	process.exit(1);
}