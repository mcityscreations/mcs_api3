import { Controller, Get, Query, Param } from '@nestjs/common';
import { PrestashopAdapter } from '../adapters/prestashop.adapter.js';
import { StoresService } from '../services/stores.service.js';
import { DateFilterDto } from '../../../common/dates/datefilter.dto.js';
import { PrestashopInvoiceIDDto } from '../dto/invoiceParam.dto.js';

@Controller('stores')
export class StoresController {
	constructor(
		private readonly PrestashopAdapter: PrestashopAdapter,
		private readonly storesService: StoresService,
	) {}

	@Get('prestashop/invoices/date-period')
	async getInvoicesByDatePeriod(@Query() datePeriod: DateFilterDto) {
		return this.PrestashopAdapter.getInvoicesByDatePeriod(datePeriod);
	}

	@Get('prestashop/invoices/:invoiceID')
	async getInvoiceByID(
		@Param('invoiceID') { invoiceID }: PrestashopInvoiceIDDto,
	) {
		return this.PrestashopAdapter.getInvoiceDetail(invoiceID);
	}

	@Get('prestashop/invoices/last')
	async getLastInvoice() {
		return this.storesService.downloadLastInvoices();
	}
}
