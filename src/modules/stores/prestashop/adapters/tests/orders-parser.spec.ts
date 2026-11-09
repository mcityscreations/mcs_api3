import { xmlToJsonConverter } from '../../../../../common/utils/XMLToJson.utils.js';
import { PrestashopOrdersResponseSchema } from '../../schemas/order.schema.js';
import { prestashopOrdersMock } from '../../schemas/mocks/orders.mock.js';

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
