import { ValidationError } from '../../system/errors/index.js';
export function slugGenerator(input: string): string {
	if (!input || typeof input !== 'string') {
		throw new ValidationError(
			'Invalid input: Input must be a non-empty string.',
		);
	}
	input = input.trim();
	input = input.replace(/-/g, ' ');
	input = input.replace(/ /g, '-');
	input = input.replace(/,/g, '');
	input = input.replace(/\(/g, '');
	input = input.replace(/\)/g, '');
	input = input.replace(/\./g, '');
	input = input.replace(/'/g, '-');
	input = input.replace(/"/g, '-');
	input = input.replace(/&eacute;/g, 'e');
	input = input.replace(/&Eacute;/g, 'e');
	input = input.replace(/&egrave;/g, 'e');
	input = input.replace(/&Egrave;/g, 'e');
	input = input.replace(/&euml;/g, 'e');
	input = input.replace(/&ecirc;/g, 'e');
	input = input.replace(/&Ecirc;/g, 'e');
	input = input.replace(/&ocirc;/g, 'o');
	input = input.replace(/&ucirc;/g, 'u');
	input = input.replace(/&icirc;/g, 'i');
	input = input.replace(/&Icirc;/g, 'i');
	input = input.replace(/&agrave;/g, 'a');
	input = input.replace(/&Agrave;/g, 'a');
	input = input.replace(/&acirc;/g, 'a');
	input = input.replace(/&Acirc;/g, 'a');
	input = input.replace(/&uuml;/g, 'u');
	input = input.replace(/&ccedil;/g, 'c');
	input = input.replace(/&Ccedil;/g, 'c');
	input = input.replace(/&iuml;/g, 'i');
	input = input.replace(/&Iuml;/g, 'i');
	input = input.replace(/&#039;/g, '-');
	input = input.replace(/&comma;/g, '');
	input = input.replace(/&apos;/g, '-');
	input = input.replace(/&atilde;/g, 'a');
	input = input.replace(/&ntilde;/g, 'n');
	input = input.replace(/é/g, 'e');
	input = input.replace(/è/g, 'e');
	input = input.replace(/ê/g, 'e');
	input = input.replace(/ë/g, 'e');
	input = input.replace(/a/g, 'a');
	input = input.replace(/ã/g, 'a');
	input = input.replace(/à/g, 'a');
	input = input.replace(/â/g, 'a');
	input = input.replace(/ä/g, 'a');
	input = input.replace(/o/g, 'o');
	input = input.replace(/ô/g, 'o');
	input = input.replace(/ö/g, 'o');
	input = input.replace(/ü/g, 'u');
	input = input.replace(/ï/g, 'i');
	input = input.replace(/î/g, 'i');
	input = input.replace(/ñ/g, 'n');
	input = input.replace(/ç/g, 'c');
	input = input.replace(/ß/g, 'ss');
	input = input.replace(/ÿ/g, 'y');
	input = input.replace(/Â/g, 'a');
	input = input.replace(/Ä/g, 'a');
	input = input.replace(/À/g, 'a');
	input = input.replace(/Ã/g, 'a');
	input = input.replace(/Å/g, 'a');
	input = input.replace(/Æ/g, 'ae');
	input = input.replace(/Ç/g, 'c');
	input = input.replace(/É/g, 'e');
	input = input.replace(/È/g, 'e');
	input = input.replace(/Ê/g, 'e');
	input = input.replace(/Ë/g, 'e');

	input = input.toLowerCase();
	return input;
}
