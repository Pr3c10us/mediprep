import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { CustomError } from "../errors/customError";
import Logger from "../utils/logger";
import { ErrorResponse } from "../responses/error";
import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import { PostgresError } from "pg-error-enum";

const ErrorHandlerMiddleware: ErrorRequestHandler = async (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log(err);
    if (err instanceof CustomError) {
        return new ErrorResponse(res, err.message, err.statusCode).send();
    }
    if (err instanceof ZodError) {
        const errorMessages = err.errors.map((issue: any) => ({
            message: `${issue.path.join(".")} is ${issue.message}`,
        }));
        return new ErrorResponse(res, "Invalid data", StatusCodes.BAD_REQUEST, {
            details: errorMessages,
        }).send();
    }

    if (err.code) {
        switch (err.code) {
            case "23505":
                return new ErrorResponse(
                    res,
                    "Duplicate key value violates unique constraint",
                    StatusCodes.BAD_REQUEST,
                    err.message
                ).send();

            case "23503":
                return new ErrorResponse(
                    res,
                    "Foreign key violation",
                    StatusCodes.BAD_REQUEST,
                    err.message
                ).send();

            case "42P01":
                return new ErrorResponse(
                    res,
                    "undefined table",
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    err.message
                ).send();
        }
    }

    return new ErrorResponse(res).send();
};

export default ErrorHandlerMiddleware;
