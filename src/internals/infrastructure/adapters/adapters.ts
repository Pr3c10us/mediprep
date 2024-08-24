import {PoolClient} from "pg";
import {Environment} from "../../../pkg/configs/env";
import {EmailRepositoryAzure} from "./notifications/azure/email";
import {QueueRepositoryKafka} from "./queue/kafka/email";
import {Kafka} from "kafkajs";
import {AdminRepositoryDrizzle} from "./persistence/database/drizzle/admin";
import {ExamRepositoryDrizzle} from "./persistence/database/drizzle/exam";
import {AzureStorageRepository} from "./persistence/storage/azure";
import {BlobServiceClient} from "@azure/storage-blob";
import {UserRepositoryDrizzle} from "./persistence/database/drizzle/user";
import {SalesRepositoryDrizzle} from "./persistence/database/drizzle/sale";
import {UserExamAccessRepository} from "../../domain/examAccess/repository";
import {UserExamAccessRepositoryDrizzle} from "./persistence/database/drizzle/examAccess";
import {TestRepository} from "../../domain/tests/repository";
import {TestRepositoryDrizzle} from "./persistence/database/drizzle/test";
import {CartRepository} from "../../domain/carts/repository";
import {CartRepositoryDrizzle} from "./persistence/database/drizzle/cart";
import {createClient} from "redis";
import {CacheRepository} from "../../domain/cache/repository";
import {RedisCacheRepository} from "./persistence/cache/redis";
import {Paystack} from "paystack-sdk";
import Stripe from "stripe";

export class Adapter {
    EnvironmentVariables

    QueueRepository

    EmailRepository


    StorageRepository

    AdminRepository

    ExamRepository

    UserRepository

    salesRepository

    userExamAccessRepository: UserExamAccessRepository

    testRepositories: TestRepository

    cartRepositories: CartRepository

    CacheRepository : CacheRepository

    PaystackClient:  Paystack
    StripeClient:  Stripe


    constructor(
        dbClient: PoolClient,
        azureBlobClient: BlobServiceClient,
        kafka: Kafka,
        environmentVariables: Environment,
        redisClient:  ReturnType<typeof createClient>,
        paystackClient:  Paystack,
        stripeClient:  Stripe
    ) {
        this.EnvironmentVariables = environmentVariables;
        this.QueueRepository = new QueueRepositoryKafka(kafka);
        this.EmailRepository = new EmailRepositoryAzure(environmentVariables);
        this.StorageRepository = new AzureStorageRepository(azureBlobClient, environmentVariables)
        this.AdminRepository = new AdminRepositoryDrizzle(dbClient)
        this.ExamRepository = new ExamRepositoryDrizzle(dbClient)
        this.UserRepository = new UserRepositoryDrizzle(dbClient)
        this.salesRepository = new SalesRepositoryDrizzle(dbClient)
        this.userExamAccessRepository = new UserExamAccessRepositoryDrizzle(dbClient)
        this.testRepositories = new TestRepositoryDrizzle(dbClient)
        this.cartRepositories = new CartRepositoryDrizzle(dbClient)
        this.CacheRepository = new RedisCacheRepository(redisClient,environmentVariables)
        this.PaystackClient = paystackClient
        this.StripeClient = stripeClient
    }
}
