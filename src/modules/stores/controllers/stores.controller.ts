import {
	Controller,
	Get,
	Query,
	Param,
	Inject,
	UseGuards,
} from '@nestjs/common';
import { MandatoryAuthGuard } from '../../security/guards/mandatory-auth/mandatory-auth.guard.js';
import { PrestashopAdapter } from '../prestashop/adapters/prestashop.adapter.js';
import { StoresService } from '../services/stores.service.js';
import { DateFilterDto } from '../../../common/dates/datefilter.dto.js';
import { PrestashopInvoiceIDDto } from '../prestashop/dto/invoiceParam.dto.js';

@Controller('stores')
export class StoresController {
	constructor(
		@Inject('PRESTASHOP_STORE')
		private readonly prestashopAdapter: PrestashopAdapter,
		private readonly storesService: StoresService,
	) {}

	@UseGuards(MandatoryAuthGuard)
	@Get('prestashop/invoices/date-period')
	async getInvoicesByDatePeriod(@Query() datePeriod: DateFilterDto) {
		return this.prestashopAdapter.getInvoicesByDatePeriod(datePeriod);
	}

	@UseGuards(MandatoryAuthGuard)
	@Get('prestashop/invoices/last')
	async getLastInvoice() {
		return this.storesService.getLastInvoices();
	}

	@UseGuards(MandatoryAuthGuard)
	@Get('prestashop/invoices/:invoiceID')
	async getInvoiceByID(
		@Param('invoiceID') { invoiceID }: PrestashopInvoiceIDDto,
	) {
		return this.prestashopAdapter.getInvoiceDetail(invoiceID);
	}
}
