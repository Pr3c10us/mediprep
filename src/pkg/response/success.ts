import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export class SuccessResponse {
    success: Success;
    constructor(data?: any, metadata?: any) {
        this.success = {
            statusCode: StatusCodes.OK,
            message: "success",
        };

        if (data !== null && data !== undefined) {
            this.success.data = data;
        }

        if (metadata !== null && metadata !== undefined) {
            this.success.metadata = metadata;
        }
    }

    send = (res: Response) => {
        res.status(this.success.statusCode).json(this.success);
    };
}

type Success = {
    statusCode: number;
    message: string;
    data?: any;
    metadata?: any;
};
