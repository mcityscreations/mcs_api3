// src/security/recaptcha/recaptcha.service.ts
import {
	BadRequestException,
	Injectable,
	Inject,
	ServiceUnavailableException,
	InternalServerErrorException,
	OnModuleInit,
} from '@nestjs/common';
import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';
import { ISecurityEvaluationResult } from '../security.interfaces';
import type { IRecaptchaConfig } from './recaptcha-config/recaptcha-config.service';
import { getErrorMessage } from '../../common/types/error.types';
import { WinstonLoggerService } from '../../system/logger/logger-service/winston-logger.service';

@Injectable()
export class RecaptchaService implements OnModuleInit {
	private RECAPTCHA_PROJECT_ID;
	private RECAPTCHA_KEY;
	private GOOGLE_APPLICATION_CREDENTIALS;
	private client: RecaptchaEnterpriseServiceClient;

	// Recaptcha thresholds
	private readonly BLOCK_THRESHOLD = 0.1;
	private readonly MFA_THRESHOLD = 0.9;

	constructor(
		@Inject('RECAPTCHA_CONFIG_TOKEN') config: IRecaptchaConfig,
		private readonly logger: WinstonLoggerService,
	) {
		this.RECAPTCHA_PROJECT_ID = config.projectId;
		this.RECAPTCHA_KEY = config.recaptchaSiteKey;
		this.GOOGLE_APPLICATION_CREDENTIALS = config.googleApplicationCredentials;
	}

	async onModuleInit() {
		try {
			// 💡 Creating Recaptcha client
			if (
				!this.GOOGLE_APPLICATION_CREDENTIALS ||
				this.GOOGLE_APPLICATION_CREDENTIALS === ''
			) {
				throw new InternalServerErrorException(
					'GOOGLE_APPLICATION_CREDENTIALS is not defined or empty.',
				);
			}
			this.client = new RecaptchaEnterpriseServiceClient();

			this.logger.log('reCAPTCHA Client initialisé.', {
				context: 'RecaptchaService',
			});

			await Promise.resolve();
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			const errorStack = error instanceof Error ? error.stack : '';
			this.logger.error(
				"Erreur critique: Échec de l'initialisation du client reCAPTCHA.",
				errorStack,
				{
					details: errorMessage,
					context: 'RecaptchaService',
				},
			);
			throw new InternalServerErrorException(
				'Critical: Failed to initialize reCAPTCHA client.',
			);
		}
	}

	public async createAssessment(token: string, actionName: string) {
		// Retrieving the project path
		if (typeof this.RECAPTCHA_PROJECT_ID !== 'string') {
			throw new InternalServerErrorException(
				'RECAPTCHA_PROJECT_ID is not defined or invalid.',
			);
		}
		const projectPath = this.client.projectPath(this.RECAPTCHA_PROJECT_ID);

		// Creating request.
		if (typeof this.RECAPTCHA_KEY !== 'string') {
			throw new InternalServerErrorException(
				'RECAPTCHA_PROJECT_ID is not defined or invalid.',
			);
		}
		const request = {
			assessment: {
				event: {
					token: token,
					siteKey: this.RECAPTCHA_KEY,
				},
			},
			parent: projectPath,
		};

		try {
			const [response] = await this.client.createAssessment(request);

			// 1. Checking token validity (User error - 400 Bad Request)
			if (!response?.tokenProperties?.valid) {
				this.logger.warn(
					`Token reCAPTCHA invalide: ${response?.tokenProperties?.invalidReason}`,
					{
						reason: response?.tokenProperties?.invalidReason,
						context: 'RecaptchaService',
					},
				);
				throw new BadRequestException(
					'Le jeton reCAPTCHA est invalide ou expiré.',
				);
			}

			// 2. Checking action name consistency (User error - 400 Bad Request)
			if (response.tokenProperties.action !== actionName) {
				this.logger.warn(
					`Action reCAPTCHA incohérente: attendu ${actionName}, reçu ${response.tokenProperties.action}`,
					{
						expectedAction: actionName,
						receivedAction: response.tokenProperties.action,
						context: 'RecaptchaService',
					},
				);
				throw new BadRequestException(
					"L'action reCAPTCHA ne correspond pas à l'action attendue.",
				);
			}

			// 3. Success
			return response?.riskAnalysis?.score || 0; // Returns 0 by default if score is undefined
		} catch (error) {
			// 4. Handling external HTTP errors

			if (error instanceof BadRequestException) {
				// If the error was thrown at step 1 or 2, rethrow it
				throw error;
			}

			// Error 503 - Service Unavailable
			const errorStack = error instanceof Error ? error.stack : '';
			this.logger.error(
				"Erreur de communication avec l'API reCAPTCHA.",
				errorStack,
				{
					errorMessage: getErrorMessage(error),
					context: 'RecaptchaService',
				},
			);
			throw new ServiceUnavailableException(
				'Le service de vérification des risques est temporairement indisponible.',
			);
		}
	}

	public assessRiskFromRecaptchaScore(
		score: number | null | undefined,
	): ISecurityEvaluationResult {
		// If score is null or undefined, treat it as high risk
		if (score === null || score === undefined) {
			return { isAllowed: false, requiredAction: 'BLOCK' };
		}
		// High risk
		if (score <= this.BLOCK_THRESHOLD) {
			return { isAllowed: false, requiredAction: 'BLOCK' };
		}
		// Further verification required
		if (score < this.MFA_THRESHOLD) {
			return { isAllowed: false, requiredAction: 'MFA_REQUIRED' };
		}
		// Authorized (human)
		return { isAllowed: true, requiredAction: 'NONE' };
	}
}
