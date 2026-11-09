import { Injectable } from '@nestjs/common';
import {
	NotFoundError,
	ValidationError,
} from '../../../../system/errors/index.js';
import { CurrencyRepository } from '../repository/currency.repository.js';
import type { ICurrency } from '../schemas/currency.schema.js';

@Injectable()
export class CurrencyService {
	constructor(private readonly currencyRepository: CurrencyRepository) {}

	public async findOneById(id_currency: string): Promise<ICurrency | null> {
		if (!id_currency) {
			throw new ValidationError(
				`[CurrencyService] Unable to find currency : The currency ID is missing.`,
			);
		}
		const result = await this.currencyRepository.findOneById(id_currency);
		if (!result) {
			throw new NotFoundError(
				`[CurrencyService] Unable to find currency with ID ${id_currency}`,
			);
		}
		return result;
	}

	public async findOneByExternalId(payload: {
		systemSource: string;
		externalCurrencyId: string;
	}): Promise<ICurrency | null> {
		if (!payload.systemSource || !payload.externalCurrencyId) {
			throw new ValidationError(
				`[CurrencyService] Unable to find currency : The system source or external currency ID is missing.`,
			);
		}
		const result = await this.currencyRepository.findOneByExternalId(payload);
		if (!result) {
			throw new NotFoundError(
				`[CurrencyService] Unable to find currency with external ID ${payload.externalCurrencyId} from system source ${payload.systemSource}`,
			);
		}
		return result;
	}
}
