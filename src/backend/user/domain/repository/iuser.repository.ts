import { User } from '../user';
import { ObjectId } from 'mongoose';

export interface IUserRepository {
    create: (user: User) => Promise<void>;
    update: (userId: string, userName?: string,  password?: string) => Promise<void>;
    delete: (userId: string) => Promise<void>;
    findByUserId: (userId: string) => Promise<User | null>;
    findByObjectId: (objectId: ObjectId) => Promise<User | null>;
}