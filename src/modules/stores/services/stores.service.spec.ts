/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { StoresService } from './stores.service.js';
import { PrestashopAdapter } from '../adapters/prestashop.adapter.js';
import { StoresRepository } from '../repository/stores.repository.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { BullMqAdapter } from '../../../system/jobdispatcher/adapters/bullmq.adapter.js';
import { AlsService } from '../../../system/als/als.service.js';
import { jest } from '@jest/globals';

// Mock du helper d'erreur
jest.mock('../../../common/utils/error.utils.js', () => {
	return {
		getErrorMessage: (err: { message?: string }) =>
			err?.message || 'Unknown error',
	};
});

// Mock de uuidv7
jest.mock('uuid', () => ({
	__esModule: true,
	v7: () => 'mocked-uuid-v7',
}));

describe('StoresService', () => {
	let service: StoresService;
	let prestashopAdapterMock: jest.Mocked<PrestashopAdapter>;
	let loggerMock: jest.Mocked<WinstonLoggerService>;
	let jobDispatcherMock: jest.Mocked<BullMqAdapter>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				StoresService,
				{
					provide: 'PRESTASHOP_STORE',
					useValue: {
						getLastInvoices: jest.fn(),
					},
				},
				{
					provide: StoresRepository,
					useValue: {},
				},
				{
					provide: WinstonLoggerService,
					useValue: {
						log: jest.fn(),
						error: jest.fn(),
					},
				},
				{
					provide: BullMqAdapter,
					useValue: {
						dispatchBulk: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<StoresService>(StoresService);
		prestashopAdapterMock = module.get('PRESTASHOP_STORE');
		loggerMock = module.get(WinstonLoggerService);
		jobDispatcherMock = module.get(BullMqAdapter);
	});

	afterEach(() => {
		jest.clearAllMocks();
		delete (AlsService as { correlationId?: string }).correlationId;
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('downloadLastInvoices', () => {
		it('should log and return an empty array if no invoices are returned', async () => {
			// Arrange
			prestashopAdapterMock.getLastInvoices.mockResolvedValue({
				prestashop: {
					order_invoices: {
						order_invoice: [],
					},
				},
			});

			// Act
			const result = await service.downloadLastInvoices();

			// Assert
			expect(prestashopAdapterMock.getLastInvoices).toHaveBeenCalledTimes(1);
			expect(loggerMock.log).toHaveBeenCalledWith(
				'No new invoices found in PrestaShop.',
			);
			expect(jobDispatcherMock.dispatchBulk).not.toHaveBeenCalled();
			expect(result).toEqual([]);
		});

		it('should dispatch bulk jobs when invoices are found (without AlsService correlationId)', async () => {
			// Arrange
			const mockInvoice1 = { id: 101, number: 'INV-001' };
			const mockInvoice2 = { id: 102, number: 'INV-002' };

			prestashopAdapterMock.getLastInvoices.mockResolvedValue({
				prestashop: {
					order_invoices: {
						order_invoice: [mockInvoice1, mockInvoice2],
					},
				},
			} as never);

			// Act
			await service.downloadLastInvoices();

			// Assert
			expect(jobDispatcherMock.dispatchBulk).toHaveBeenCalledTimes(1);
			expect(jobDispatcherMock.dispatchBulk).toHaveBeenCalledWith(
				'store.fetch-invoice-detail',
				[
					{
						jobName: 'fetch-detail',
						payload: {
							id: expect.any(String),
							pattern: 'store.fetch-invoice-detail',
							timestamp: expect.any(String),
							version: '1.0.0',
							correlationId: expect.any(String),
							data: mockInvoice1,
						},
						options: {
							attempts: 3,
							backoff: { type: 'exponential', delay: 5000 },
						},
					},
					{
						jobName: 'fetch-detail',
						payload: {
							id: expect.any(String),
							pattern: 'store.fetch-invoice-detail',
							timestamp: expect.any(String),
							version: '1.0.0',
							correlationId: expect.any(String),
							data: mockInvoice2,
						},
						options: {
							attempts: 3,
							backoff: { type: 'exponential', delay: 5000 },
						},
					},
				],
			);
			expect(loggerMock.log).toHaveBeenCalledWith(
				'Successfully dispatched 2 invoice IDs to the queue.',
			);
		});

		it('should use AlsService correlationId if available', async () => {
			// Arrange
			const customCorrelationId = 'custom-correlation-id-123';
			(AlsService as { correlationId?: string }).correlationId =
				customCorrelationId;

			const mockInvoice = { id: 101 };
			prestashopAdapterMock.getLastInvoices.mockResolvedValue({
				prestashop: {
					order_invoices: {
						order_invoice: [mockInvoice],
					},
				},
			} as never);

			// Act
			await service.downloadLastInvoices();

			// Assert
			expect(jobDispatcherMock.dispatchBulk).toHaveBeenCalledWith(
				'store.fetch-invoice-detail',
				expect.arrayContaining([
					expect.objectContaining({
						payload: expect.objectContaining({
							correlationId: customCorrelationId,
						}) as Record<string, unknown>,
					}) as Record<string, unknown>,
				]),
			);
		});

		it('should throw InternalServerErrorException if PrestaShop adapter fails', async () => {
			// Arrange
			const apiError = new Error('PrestaShop connection error');
			prestashopAdapterMock.getLastInvoices.mockRejectedValue(apiError);

			// Act & Assert
			await expect(() => service.downloadLastInvoices()).rejects.toThrow(
				InternalServerErrorException,
			);
			await expect(() => service.downloadLastInvoices()).rejects.toThrow(
				'Failed to download last invoices: Error: PrestaShop connection error',
			);
		});

		it('should throw InternalServerErrorException if jobDispatcher fails', async () => {
			// Arrange
			prestashopAdapterMock.getLastInvoices.mockResolvedValue({
				prestashop: {
					order_invoices: {
						order_invoice: [{ id: 1 }],
					},
				},
			} as never);

			jobDispatcherMock.dispatchBulk.mockRejectedValue(
				new Error('Redis connection down'),
			);

			// Act & Assert
			await expect(() => service.downloadLastInvoices()).rejects.toThrow(
				InternalServerErrorException,
			);
			await expect(() => service.downloadLastInvoices()).rejects.toThrow(
				'Failed to download last invoices: Error: Redis connection down',
			);
		});
	});
});
