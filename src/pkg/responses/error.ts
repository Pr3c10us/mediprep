import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export class ErrorResponse {
    response: Response;
    error: Error;
    constructor(
        res: Response,
        errorMessage?: string,
        statusCode?: number,
        err?: any
    ) {
        this.response = res;
        this.error = {
            statusCode: statusCode
                ? statusCode
                : StatusCodes.INTERNAL_SERVER_ERROR,
            message: errorMessage ? errorMessage : "internal server error",
        };
        if (err !== null && err !== undefined) {
            this.error.error = err;
        }
    }

    send = () => {
        this.response.status(this.error.statusCode).json(this.error);
    };
}

type Error = {
    statusCode: number;
    message: string;
    error?: any;
};
