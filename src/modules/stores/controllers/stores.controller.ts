import { Controller, Get, Query, Param } from '@nestjs/common';
import { PrestashopAdapter } from '../adapters/prestashop.adapter.js';
import { DateFilterDto } from '../../../common/dates/datefilter.dto.js';
import { PrestashopInvoiceIDDto } from '../dto/invoiceParam.dto.js';

@Controller('stores')
export class StoresController {

    constructor(private readonly PrestashopAdapter: PrestashopAdapter,) {}

    @Get('prestashop/invoices')
    async getInvoicesByDatePeriod(@Query() datePeriod: DateFilterDto){
        return this.PrestashopAdapter.getInvoicesByDatePeriod(datePeriod);
    }

    @Get('prestashop/invoices/:invoiceID')
    async getInvoiceByID(@Param('invoiceID') { invoiceID }: PrestashopInvoiceIDDto){
        return this.PrestashopAdapter.getInvoiceDetail(invoiceID);
    }
     
}
