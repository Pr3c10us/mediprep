import { StatusCodes } from "http-status-codes";

export class CustomError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    }
}

export class NotFoundError extends CustomError {
    constructor(message: string) {
        super(message);
        this.statusCode = StatusCodes.NOT_FOUND;
    }
}
