import { NextFunction, Request, Response } from "express";
import { z } from "zod";

type RequestData = "body" | "query" | "params" | "headers" | "url";

const ValidationMiddleware = (
    schema: z.ZodObject<any, any>,
    reqData: RequestData
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req[reqData]);
            next();
        } catch (error) {
            throw error;
        }
    };
};

export default ValidationMiddleware;
