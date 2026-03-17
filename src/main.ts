import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { corsFactory } from './modules/security/cors/cors.factory.js';
import { ZodValidationPipe } from 'nestjs-zod';
import { WinstonLoggerService } from './system/logger/logger-service/winston-logger.service.js';

async function bootstrap() {
	// Starting application
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true, // Keeps logs in buffer until a logger is set
	});

	const configService = app.get(ConfigService);

	// Applying security middleware
	app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", configService.get('CORS_ORIGIN') ?? ''],
            },
        }
	}));

	// Enabling CORS with custom configuration
	app.enableCors(corsFactory(configService));

	// Retrieving Winston Logger instance
	const winstonLoggerService = app.get(WinstonLoggerService);

	// Replacing the default Logger with the custom Winston logger
	app.useLogger(winstonLoggerService);

	// Applying Zod validation pipe globally
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
