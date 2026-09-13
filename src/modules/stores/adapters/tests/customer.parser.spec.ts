import { xmlToJsonConverter } from '../../../../common/utils/XMLToJson.utils.js';
import { PrestashopCustomersResponseSchema } from '../../schemas/prestashop/customer.schema.js';
import { prestashopCustomerMock } from '../../schemas/prestashop/mocks/customer.mock.js';

describe('PrestaShop XML Parsing & Validation', () => {
	it('should convert the XML and validate the Zod schema without errors', () => {
		const jsonRaw = xmlToJsonConverter(prestashopCustomerMock);
		const result = PrestashopCustomersResponseSchema.safeParse(jsonRaw);

		if (!result.success) {
			console.log(result.error);
		}

		expect(result.success).toBe(true);
	});
});
