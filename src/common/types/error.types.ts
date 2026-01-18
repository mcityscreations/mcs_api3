// src/common/types/error.types.ts

// Defining a common error type with a message property
export interface IErrorWithMessage extends Error {
	name: string;
	message: string;
}

export interface IIsExceptionObject {
	statusCode: number;
	message: string | string[];
}
