import { Request, Response } from "express";
import { NotFoundError } from "../errors/customError";

const Route404 = (req: Request, res: Response) => {
    throw new NotFoundError("404 ROUTE!!!");
};

export default Route404;
