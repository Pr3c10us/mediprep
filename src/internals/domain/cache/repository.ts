export interface CacheRepository {
    Set(key: string, value: string, expires: number) : Promise<void>
}