import { InternalServerErrorException } from '@nestjs/common';
import XMLBuilder from 'fast-xml-builder';
/**
 * Converts a JSON object to XML format with a specified root element name.
 * @param json
 * @param rootElementName ex 'prestashop'
 * @returns
 */
export function jsonToXMLConverter(
	json: unknown,
	rootElementName: string,
): string {
	// Basic validation to ensure input is an object and rootElementName is a non-empty string
	if (typeof rootElementName !== 'string' || rootElementName.trim() === '') {
		throw new InternalServerErrorException(
			'Root element name must be a non-empty string',
		);
	}
	if (typeof json !== 'object' || json === null) {
		throw new InternalServerErrorException('Input must be a non-null object');
	}
	const builder = new XMLBuilder({
		ignoreAttributes: false,
		format: true,
		cdataPropName: '#',
		attributeNamePrefix: '@_',
		suppressEmptyNode: true,
	});
	const xmlContent = builder.build({ [rootElementName]: json });
	return xmlContent;
}
