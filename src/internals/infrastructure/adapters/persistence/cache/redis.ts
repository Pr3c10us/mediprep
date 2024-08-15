import {Environment} from "../../../../../pkg/configs/env";
import {createClient} from "redis";
import {CacheRepository} from "../../../../domain/cache/repository";


export class RedisCacheRepository implements CacheRepository {
    redisClient: ReturnType<typeof createClient>
    environmentVariable: Environment

    constructor(redisClient: ReturnType<typeof createClient>, environmentVariable: Environment) {
        this.redisClient = redisClient
        this.environmentVariable = environmentVariable
    }

    async Set(key: string, value: string, expires: number): Promise<void> {
        try {
            await this.redisClient.set(key, value, {EX: expires});
        } catch (error) {
            throw error
        }
    }

}