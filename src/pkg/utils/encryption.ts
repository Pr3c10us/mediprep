import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import {Environment} from "../configs/env";

export const encrypt = async (password: string): Promise<string> => {
    var salt = bcrypt.genSaltSync(10);
    return await bcrypt.hash(password, salt);
};

export const compareHash = (
    password: string,
    hash: string | undefined
): boolean => {
    if (hash == undefined) {
        return false;
    } else {
        return bcrypt.compareSync(password, hash);
    }
};

export const signToken = (payload: string | object, expire: boolean = true): string => {
    const environmentVariables = new Environment();
    const options: jwt.SignOptions = {};

    if (expire) {
        options.expiresIn = environmentVariables.jwtExpires;
    }

    return jwt.sign(payload, environmentVariables.jwtSecret, options);
};

export const verifyToken = (token: string) => {
    const environmentVariables = new Environment();
    return jwt.verify(token, environmentVariables.jwtSecret);
};
