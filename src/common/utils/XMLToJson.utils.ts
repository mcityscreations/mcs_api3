import { InternalServerErrorException } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';

export function xmlToJsonConverter(xml: string): unknown {
	if (typeof xml !== 'string' || xml.trim() === '') {
		throw new InternalServerErrorException(
			'Input must be a non-empty XML string',
		);
	}
	const parser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: '',
		cdataPropName: '#',
	});
	const jsonObj = parser.parse(xml) as unknown;
	return jsonObj;
}
