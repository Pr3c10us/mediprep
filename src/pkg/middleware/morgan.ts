import morgan, { StreamOptions } from "morgan";
import Logger from "../utils/logger";
import { Environment } from "../configs/env";

const environmentVariables = new Environment();

const stream: StreamOptions = {
    write: (message) => Logger.http(message),
};

const skip = () => {
    const env = environmentVariables.nodeENV || "development";
    return env !== "development";
};

const morganMiddleware = morgan(
    ":method :url :status :res[content-length] - :response-time ms",
    { stream, skip }
);

export default morganMiddleware;
