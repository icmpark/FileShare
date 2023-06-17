import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth } from '../../../domain/auth';
import { AuthDocument, AuthEntity } from '../entity/auth.entity';
import { IAuthRepository } from '../../../domain/repository/iauth.repository';


@Injectable()
export class AuthRepository implements IAuthRepository {
    constructor(
        @InjectModel(AuthEntity.name) private authModel: Model<AuthDocument>
    ) { }

    async update(auth: Auth): Promise<void> {
        const { userId, refreshToken } = auth;
        let authDocument: AuthDocument = await this.authModel.findOne({userId: userId})
        if (authDocument == null)
            authDocument = new this.authModel({userId: userId})
        authDocument.refreshToken = refreshToken;
        authDocument.save()

    }

    async delete (userId: string): Promise<void> {
        await this.authModel.deleteOne({userId: userId});
    }

    async verify(userId: string, refreshToken: string): Promise<boolean> {
        const counts: number = await this.authModel.countDocuments({userId: userId, refreshToken: refreshToken});
        return counts != 0;
    }
}