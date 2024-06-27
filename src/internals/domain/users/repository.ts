import {EditUser, User, UserExamAccess} from "./user";
import {PaginationFilter, PaginationMetaData} from "../../../pkg/types/pagination";

export interface UserRepository {
    addUser: (user: User) => Promise<User>,
    getUsers: (filter: PaginationFilter) => Promise<{users: User[], metadata: PaginationMetaData}>
    editUser: (id: string, userParams: EditUser) => Promise<void>,
    getUserDetails: (id: string) => Promise<User>
    getUserByEmail: (email: string) => Promise<User>
    deleteUserDetails: (id: string) => Promise<void>
    addUserExamAccess: (examToUser : UserExamAccess) => Promise<void>
    updateExamAccess:(examToUser : UserExamAccess) => Promise<void>
    getUserExamAccess: (examId: string,userId: string) => Promise<UserExamAccess>
}