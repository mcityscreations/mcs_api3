import { XMLBuilder } from 'fast-xml-parser';
/**
 * 
 * @param json 
 * @param rootElementName ex 'prestashop'
 * @returns 
 */
export function jsonToXMLConverter(json: any, rootElementName: string): string {
    const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
        cdataPropName: '#',
        attributeNamePrefix: '@_',
    });
    const xmlContent = builder.build({ [rootElementName]: json });
    return xmlContent;
}