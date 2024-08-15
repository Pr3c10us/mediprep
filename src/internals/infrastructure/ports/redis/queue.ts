import {Services} from "../../../app/services";
import {createClient} from "redis";

export class RedisQueue {
    services: Services;
    redisClient: ReturnType<typeof createClient>;

    constructor(
        services: Services,
        redisClient: ReturnType<typeof createClient>,
    ) {
        this.services = services;
        this.redisClient = redisClient
    }

    consumerExpiryEvent = async () => {
        await this.redisClient.configSet("notify-keyspace-events", "Ex");
        await this.redisClient.subscribe("__keyevent@0__:expired", async (key) => {
            try {
                await this.services.testServices.commands.forceEndTest.Handle(key,);
                console.log("Redis key expired: ", key);
            } catch (error) {
                console.log(error)
            }
        });
    };

    listen = async () => {
        await this.consumerExpiryEvent()
        console.log("redis listening")
    };
}
