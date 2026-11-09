import { xmlToJsonConverter } from '../../../../../common/utils/XMLToJson.utils.js';
import { PrestashopOrderDetailsResponseSchema } from '../../schemas/order-detail.schema.js';
import { prestashopOrderDetailsMock } from '../../schemas/mocks/order-detail.mock.js';

describe('PrestaShop XML Parsing & Validation', () => {
	it('should convert the XML and validate the Zod schema without errors', () => {
		const jsonRaw = xmlToJsonConverter(prestashopOrderDetailsMock);

		const result = PrestashopOrderDetailsResponseSchema.safeParse(jsonRaw);

		if (!result.success) {
			console.log(result.error);
		}

		expect(result.success).toBe(true);
	});
});
