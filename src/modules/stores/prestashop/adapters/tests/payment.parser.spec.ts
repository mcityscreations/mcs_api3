import { xmlToJsonConverter } from '../../../../../common/utils/XMLToJson.utils.js';
import { PrestashopPaymentListSchema } from '../../schemas/payment.schema.js';
import { prestashopPaymentMock } from '../../schemas/mocks/payment.mock.js';

describe('PrestaShop XML Parsing & Validation', () => {
	it('should convert the XML and validate the Zod schema without errors', () => {
		const jsonRaw = xmlToJsonConverter(prestashopPaymentMock);
		const result = PrestashopPaymentListSchema.safeParse(jsonRaw);

		if (!result.success) {
			console.log(result.error);
		}

		expect(result.success).toBe(true);
	});
});
