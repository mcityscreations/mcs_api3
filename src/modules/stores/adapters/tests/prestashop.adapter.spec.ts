import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { PrestashopAdapter } from '../prestashop.adapter.js';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { StoresRepository } from '../../repository/stores.repository.js';
import { xmlValidator } from '../../../../common/validators/xml.validators.js';
import { WinstonLoggerService } from '../../../../system/logger/logger-service/winston-logger.service.js';
import { prestashopInvoiceListMock } from '../../schemas/prestashop/mocks/invoice-list.mock.js';

describe('PrestashopAdapter', () => {
	let service: PrestashopAdapter;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PrestashopAdapter],
		}).compile();

		service = module.get<PrestashopAdapter>(PrestashopAdapter);
	});

	it('should be defined', function (this: void) {
		expect(service).toBeDefined();
	});
});

// 1. Mocking external dependencies
jest.mock('axios');
jest.mock('../../../common/validators/xml.validators.js');
jest.mock('../../../system/logger/logger-service/winston-logger.service.ts');

describe('PrestashopAdapter - getLastInvoices', () => {
	let service: PrestashopAdapter;
	let storesRepository: jest.Mocked<StoresRepository>;

	const mockAxios = axios as jest.Mocked<typeof axios>;
	const mockXmlValidator = xmlValidator as jest.MockedFunction<
		typeof xmlValidator
	>;
	const mockLogger: jest.Mocked<Partial<WinstonLoggerService>> = {
		log: jest.fn(),
		error: jest.fn(),
		warn: jest.fn(),
	};

	beforeEach(async () => {
		// Définition du mock pour le repository
		const mockStoresRepository = {
			getLastPrestashopInvoiceID: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PrestashopAdapter,
				{
					provide: StoresRepository,
					useValue: mockStoresRepository,
				},
			],
		}).compile();

		service = module.get<PrestashopAdapter>(PrestashopAdapter);
		storesRepository = module.get(StoresRepository);

		// Configuration des propriétés privées / membres du service si nécessaire
		(service as any).apiEndpoint = 'https://api.prestashop.com';
		(service as any).authorizationKey = 'Basic XYZ123';
		(service as any).logger = {
			error: jest.fn(),
		};

		jest.clearAllMocks();
	});

	describe("Quand aucune facture n'est stockée en base (lastInvoiceID === 0)", () => {
		it("devrait récupérer toutes les factures depuis l'ID 1 et retourner le résultat parsé", async () => {
			const mockRawXml = prestashopInvoiceListMock;
			const mockParsedResult = {
				prestashop: { order_invoices: [{ id: 43 }] },
			};

			storesRepository.getLastPrestashopInvoiceID.mockResolvedValue(0);
			mockAxios.get.mockResolvedValue({ data: mockRawXml });
			mockXmlValidator.mockReturnValue(mockParsedResult);

			// Act
			const result = await service.getLastInvoices();

			// Assert
			expect(storesRepository.getLastPrestashopInvoiceID).toHaveBeenCalledTimes(
				1,
			);
			expect(mockAxios.get).toHaveBeenCalledWith(
				'https://api.prestashop.com/order_invoices',
				{
					params: {
						'filter[id]': '[1, 999999]',
						display: 'full',
					},
					paramsSerializer: { indexes: null },
					headers: { Authorization: 'Basic XYZ123' },
				},
			);
			expect(mockXmlValidator).toHaveBeenCalledWith(
				mockRawXml,
				expect.anything(),
				'invoice list',
				'PrestaShop',
			);
			expect(result).toEqual(mockParsedResult);
		});

		it("devrait logger l'erreur et lever une InternalServerErrorException si Axios échoue", async () => {
			// Arrange
			storesRepository.getLastPrestashopInvoiceID.mockResolvedValue(0);
			const apiError = new Error('Network Error');
			mockAxios.get.mockRejectedValue(apiError);

			// Act & Assert
			await expect(service.getLastInvoices()).rejects.toThrow(
				InternalServerErrorException,
			);
			expect(mockLogger.error).toHaveBeenCalledWith(
				'Error fetching invoices from PrestaShop',
				'Network Error',
			);
		});
	});

	describe('Quand des factures existent déjà en base (lastInvoiceID > 0)', () => {
		it('devrait calculer nextInvoiceID (lastInvoiceID + 1) et filtrer la requête PrestaShop', async () => {
			// Arrange
			const lastID = 42;
			const nextID = 43;
			const mockRawXml = `
				<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
				<order_invoices>
				<order_invoice>
						<id><![CDATA[43]]></id>
				</order_invoice>
				</order_invoices>
				</prestashop>`;
			const mockParsedResult = {
				prestashop: { order_invoices: [{ id: 43 }] },
			};

			storesRepository.getLastPrestashopInvoiceID.mockResolvedValue(lastID);
			mockAxios.get.mockResolvedValue({ data: mockRawXml });
			mockXmlValidator.mockReturnValue(mockParsedResult);

			// Act
			const result = await service.getLastInvoices();

			// Assert
			expect(mockAxios.get).toHaveBeenCalledWith(
				'https://api.prestashop.com/order_invoices',
				{
					params: {
						'filter[id]': `[${nextID}, 999999]`,
						display: 'full',
					},
					headers: { Authorization: 'Basic XYZ123' },
				},
			);
			expect(result).toEqual(mockParsedResult);
		});
	});
});
