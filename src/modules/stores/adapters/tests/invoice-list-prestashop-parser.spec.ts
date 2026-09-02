import { xmlToJsonConverter } from '../../../../common/utils/XMLToJson.utils.js';
import { PrestashopInvoiceListSchemaFull } from '../../schemas/prestashop/invoices.schema.js';
import { prestashopInvoiceListMock } from '../../schemas/prestashop/mocks/invoice-list.mock.js';

describe('PrestaShop XML Parsing & Validation', () => {
	it('should convert the XML and validate the Zod schema without errors', () => {
		const jsonRaw = xmlToJsonConverter(prestashopInvoiceListMock);

		const result = PrestashopInvoiceListSchemaFull.safeParse(jsonRaw);

		if (!result.success) {
			console.log(result.error);
		}

		expect(result.success).toBe(true);
	});
});
