import { Auth } from '../auth';

export interface IAuthRepository {
    update: (auth: Auth) => Promise<void>;
    delete: (userId: string) => Promise<void>;
    verify: (userId: string, refreshToken: string) => Promise<boolean>;
}