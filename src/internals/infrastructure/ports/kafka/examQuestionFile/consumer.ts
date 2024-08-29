import {Consumer, Kafka} from "kafkajs";
import {Environment} from "../../../../../pkg/configs/env";
import Logger from "../../../../../pkg/utils/logger";
import csv from "csv-parser";
import {ExamQuestionFile, Option} from "../../../../domain/exams/exam";
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
                    // console.log({a: Object.entries(line), line})
                    // continue
                    const question = line

                    // skip line if a course or subject is not provided
                    if (!question.course || !question.subject) {
                        continue
                    }

                    const courseId = await this.getCourseId(question.course, data.examId)
                    const subjectId = await this.getSubjectId(question.subject, courseId)
                    const optionsParams = JSON.parse(question.options)
                    const options: Option[] = optionsParams.map((option: any): Option => {
                        if (option.explanation) {
                            question.explanation += "\n"
                            question.explanation += option.explanation
                        }
                        return {
                            value: option.option,
                            answer: option.correct,
                        }
                    })

                    await this.examServices.commands.addQuestion.Handle({
                        type: question.type,
                        question: question.question,
                        explanation: question.explanation,
                        subjectId: subjectId,
                        options,
                        questionBatchId: data.batchId
                    })
                } catch (error) {
                    console.log(error)
                    continue
                }
            }

            await this.examServices.examRepository.UpdateQuestionBatchStatus(data.batchId, 'complete')
            console.log("Questions addition completed")
            // const options: BlobDeleteOptions = {
            //     deleteSnapshots: 'include'
            // }
            // await blobClient.deleteIfExists(options)
            // console.log("blob deleted")
        } catch (error) {
            await this.examServices.examRepository.UpdateQuestionBatchStatus(data.batchId, 'failed')
            // const options: BlobDeleteOptions = {
            //     deleteSnapshots: 'include'
            // }
            // await blobClient.deleteIfExists(options)
            Logger.error("Failed to Process Questions");
            console.log(error);
        }
    };

    extractQuestion = (line: any): any => {
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
            })
        }
        question.options = options
        return question
    }

    getCourseId = async (courseName: string, examId: string): Promise<string> => {
        let courseId: string
        const course = await this.examServices.queries.getCourses.handle({
            limit: 1,
            page: 1,
            name: courseName,
            examId: examId
        })
        if (course.courses.length < 1) {
            const newCourse = await this.examServices.commands.addCourse.Handle({
                name: courseName,
                examId: examId
            })
            courseId = newCourse.id as string
        } else {
            courseId = course.courses[0].id as string
        }
        return courseId
    }

    getSubjectId = async (subjectName: string, courseId: string): Promise<string> => {
        let subjectId: string
        const subject = await this.examServices.queries.getSubjects.handle({
            limit: 1,
            page: 1,
            name: subjectName,
            courseId
        })
        if (subject.subjects.length < 1) {
            const newSubject = await this.examServices.commands.addSubject.Handle({
                name: subjectName,
                courseId: courseId
            })
            subjectId = newSubject.id as string
        } else {
            subjectId = subject.subjects[0].id as string
        }
        return subjectId
    }
}
