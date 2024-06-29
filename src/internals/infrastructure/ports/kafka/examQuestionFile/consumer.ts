import {Consumer, Kafka} from "kafkajs";
import {Environment} from "../../../../../pkg/configs/env";
import Logger from "../../../../../pkg/utils/logger";
import csv from "csv-parser";
import {ExamQuestionFile, Option, Question} from "../../../../domain/exams/exam";
import {BlobDeleteOptions, BlobServiceClient, ContainerClient} from "@azure/storage-blob";
import {ExamServices} from "../../../../app/exam/exam";

export class ExamQuestionFileConsumer {
    environmentVariable: Environment;
    examServices: ExamServices;
    blobClient: BlobServiceClient;
    consumer: Consumer;

    constructor(
        examServices: ExamServices,
        blobClient: BlobServiceClient,
        kafka: Kafka,
        environmentVariable: Environment
    ) {
        this.environmentVariable = environmentVariable;
        this.examServices = examServices;
        this.blobClient = blobClient;
        this.consumer = kafka.consumer({
            groupId: environmentVariable.kafkaExamQuestionFileGroupID,
        });
    }

    run = async () => {
        await this.consumer.connect();
        await this.consumer.subscribe({
            topic: this.environmentVariable.kafkaExamQuestionFileTopic,
            fromBeginning: true,
        });

        await this.consumer.run({
            eachMessage: async ({topic, partition, message}) => {
                const data: ExamQuestionFile = JSON.parse(String(message.value)) as ExamQuestionFile;
                await this.handle(data);
            },
        });
    };

    handle = async (data: ExamQuestionFile) => {
        const containerClient: ContainerClient = this.blobClient.getContainerClient(this.environmentVariable.azExamQuestionFileContainer)
        const blobClient = containerClient.getBlockBlobClient(data.blobName);
        try {
            const downloadResponse = await blobClient.download();

            const rl = downloadResponse.readableStreamBody?.pipe(csv());
            if (!rl) {
                throw new Error()
            }

            for await (const line of rl) {
                try {
                    let question: any = {}
                    let options: Option[] = []

                    // Track options with their explanations
                    let tempOptions: { [key: string]: { value: string, explanation: string } } = {}

                    for (const [key, value] of Object.entries(line)) {
                        if (!value) {
                            continue
                        }
                        if (key.includes("option") && !key.includes("Explanation")) {
                            // Option without explanation
                            const optionKey = key.split("option")[1]
                            tempOptions[optionKey] = {
                                value: value as string,
                                explanation: ""
                            }
                        } else if (key.includes("Explanation") && (typeof value === "string")) {
                            // Explanation for an option
                            const optionKey = key.split("option")[1].split("Explanation")[0]
                            if (tempOptions[optionKey]) {
                                tempOptions[optionKey].explanation = value
                            }
                        } else {
                            if (key != "correctOption") question[key] = value
                        }
                    }

                    // Construct the options array
                    for (const [key, option] of Object.entries(tempOptions)) {
                        options.push({
                            value: option.value,
                            answer: line.correctOption.includes(key), // Assuming false as no specific answer logic is provided
                            explanation: option.explanation
                        })
                    }
                    question.options = options

                    if (!question.course || !question.subject) {
                        continue
                    }
                    console.log("0")
                    const course = await this.examServices.queries.getCourses.handle({
                        limit: 1,
                        page: 1,
                        name: question.course
                    })
                    console.log("1")
                    let courseId: string
                    if (course.courses.length < 1) {
                        const newCourse = await this.examServices.commands.addCourse.Handle({
                            name: question.course,
                            examId: data.examId
                        })
                        courseId = newCourse.id as string
                    } else {
                        courseId = course.courses[0].id as string
                    }
                    console.log("2")

                    const subject = await this.examServices.queries.getSubjects.handle({
                        limit: 1,
                        page: 1,
                        name: question.subject
                    })
                    console.log("3")
                    let subjectId: string
                    if (subject.subjects.length < 1) {
                        const newSubject = await this.examServices.commands.addSubject.Handle({
                            name: question.subject,
                            courseId: courseId
                        })
                        subjectId = newSubject.id as string
                    } else {
                        subjectId = subject.subjects[0].id as string
                    }
                    console.log("4")
                    const Q: Question = {
                        description: question.description,
                        question: question.question,
                        questionImageUrl: question.questionImageName && `https://${this.environmentVariable.azAccountStorageName}.blob.core.windows.net/${this.environmentVariable.azQuestionImageContainerName}/${question.questionImageName}`,
                        explanation: question.explanation || "",
                        explanationImageUrl: question.explanationImageName && `https://${this.environmentVariable.azAccountStorageName}.blob.core.windows.net/${this.environmentVariable.azExplanationImageContainerName}/${question.explanationImageName}`,
                        subjectId: subjectId,
                        options: question.options
                    }

                    console.log(Q)

                    await this.examServices.commands.addQuestion.Handle(Q)
                } catch (error) {
                    console.log(error)
                    continue
                }
            }

            await this.examServices.examRepository.UpdateQuestionBatchStatus(data.batchId, 'complete')
            console.log("Questions addition completed")
            const options: BlobDeleteOptions = {
                deleteSnapshots: 'include'
            }
            await blobClient.deleteIfExists(options)
            console.log("blob deleted")
        } catch (error) {
            await this.examServices.examRepository.UpdateQuestionBatchStatus(data.batchId, 'failed')
            const options: BlobDeleteOptions = {
                deleteSnapshots: 'include'
            }
            await blobClient.deleteIfExists(options)
            Logger.error("Failed to Process Questions");
            console.log(error);
        }
    };
}
