import { xmlToJsonConverter } from '../../../../common/utils/XMLToJson.utils.js';
import { PrestashopOrdersResponseSchema } from '../../schemas/prestashop/order.schema.js';
import { prestashopOrdersMock } from '../../schemas/prestashop/mocks/orders.mock.js';

describe('PrestaShop XML Parsing & Validation', () => {
	it('should convert the XML and validate the Zod schema without errors', () => {
		const jsonRaw = xmlToJsonConverter(prestashopOrdersMock);

		const result = PrestashopOrdersResponseSchema.safeParse(jsonRaw);

		if (!result.success) {
			console.log(result.error);
		}

		expect(result.success).toBe(true);
	});
});
