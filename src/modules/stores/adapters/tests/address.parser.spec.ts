import { xmlToJsonConverter } from '../../../../common/utils/XMLToJson.utils.js';
import { PrestashopAddressesResponseSchema } from '../../schemas/prestashop/address.schema.js';
import { prestashopAddressesMock } from '../../schemas/prestashop/mocks/address.mock.js';

describe('PrestaShop XML Parsing & Validation', () => {
	it('should convert the XML and validate the Zod schema without errors', () => {
		const jsonRaw = xmlToJsonConverter(prestashopAddressesMock);
		console.log(jsonRaw.prestashop.address.id_customer);
		const result = PrestashopAddressesResponseSchema.safeParse(jsonRaw);

		if (!result.success) {
			console.log(result.error);
		}

		expect(result.success).toBe(true);
	});
});
