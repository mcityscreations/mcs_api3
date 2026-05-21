// src/common/dates/datesService.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import z from 'zod';
import { DateTime } from 'luxon';

@Injectable()
export class DateService {
	/**
	 *
	 * @param date
	 * @returns Returns date in the following format "15-10-2025 10:00:00"
	 */
	public standardDateFormater(date: Date) {
		// Checking that "date" param has the correct type
		if (!this.isJSDate) {
			throw new InternalServerErrorException(
				`Wrong type for param "date". Expecting "JS Date", ${typeof date} given.`,
			);
		}

		// 1. Retrieving date components
		const day = date.getDate();
		const month = date.getMonth() + 1; // January is 0
		const year = date.getFullYear();
		const hour = date.getHours();
		const minute = date.getMinutes();

		// 2. Adding a zero in order to always have a value with two digits (padding)
		// (ex: 5 becomes 05)
		const pad = (nombre: any) => String(nombre).padStart(2, '0');

		// 3. Assembling date components in the following format : "JJ.MM.AAAA HH.MM"
		const formattedDate = `${pad(day)}.${pad(month)}.${year} ${pad(hour)}.${pad(minute)}`;

		return formattedDate;
	}
	/**
	 * @description Returns a date in the following format
	 * YYYY-MM-DD HH:MM:SS
	 * */
	public dateTimeFormatter(date: Date) {
		if (!this.isJSDate) {
			throw new InternalServerErrorException(
				`Wrong type for param "date". Expecting "JS Date", ${typeof date} given.`,
			);
		}
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		const hour = String(date.getHours()).padStart(2, '0');
		const minute = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');

		// YYYY-MM-DD HH:MM:SS
		return `${year}-${month}-${day} ${hour}:${minute}:${seconds}`;
	}

	/**
	 * @description Returns a date in the following format
	 * YYYY-MM-DD
	 */
	public dateOnlyFormatter(date: Date) {
		if (!this.isJSDate) {
			throw new InternalServerErrorException(
				`Wrong type for param "date". Expecting "JS Date", ${typeof date} given.`,
			);
		}
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();

		return `${year}-${month}-${day}`;
	}

	public isJSDate(date: unknown): boolean {
		const isDate = z.date().safeParse(date);
		return isDate.success;
	}

	/**
	 * @description Converts a date string in "YYYY-MM-DD" or "YYYY-MM-DD HH:MM:SS" format into a JS Date object.
	 * The timezone is set to UTC.
	 * @param date The date string in "YYYY-MM-DD" or "YYYY-MM-DD HH:MM:SS" format.
	 * @param fromZone The timezone of the input date string. Defaults to 'UTC'.
	 * @returns A date object representing the given date and time in UTC.
	 * @throws InternalServerErrorException if the date string is not in the correct format or if the date is invalid.
	 */
	public stringDateToUtcDate(date: string, fromZone: string = 'UTC'): Date {
		// 1. Checking the correctness of the date format
		const trimmedDate = date.trim();
		const datePattern = /^\d{4}-\d{2}-\d{2}$/;
		const dateTimePattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
		const parsedStructure = z
			.string()
			.refine((val) => datePattern.test(val) || dateTimePattern.test(val))
			.safeParse(trimmedDate);

		if (!parsedStructure.success) {
			throw new InternalServerErrorException(
				`Wrong format for param "date". Expecting "YYYY-MM-DD" or "YYYY-MM-DD HH:MM:SS", "${date}" given.`,
			);
		}

		// 2. If this is a date-only string (ex: "2025-10-15"), we add a default time to it (00:00:00) in order to be able to process it
		const finalizedDateString = datePattern.test(trimmedDate)
			? `${trimmedDate} 00:00:00`
			: trimmedDate;

		// 3. Converting the date string into a Luxon DateTime instance, with the provided timezone (ex: "Europe/Paris")
		const localDateTime = DateTime.fromFormat(
			finalizedDateString,
			'yyyy-MM-dd HH:mm:ss',
			{
				zone: fromZone,
			},
		);

		// 4. Checking that the date makes logical sense (ex: no 30th of February)
		// OR that the provided timezone actually exists
		if (!localDateTime.isValid) {
			throw new InternalServerErrorException(
				`Invalid date or timezone. Date: "${date}", Zone: "${fromZone}". Reason: ${localDateTime.invalidReason}`,
			);
		}

		// 5. Converting the date to UTC timezone
		const utcDateTime = localDateTime.setZone('UTC');

		// 6. Extracting the JavaScript Date object for PostgreSQL
		return utcDateTime.toJSDate();
	}
}
