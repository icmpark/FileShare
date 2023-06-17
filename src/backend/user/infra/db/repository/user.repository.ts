import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../domain/user.js';
import { IUserRepository } from '../../../domain/repository/iuser.repository.js';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';
import { UserEntity, UserDocument } from '../entity/user.entity.js';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt'
import authConfig from '../../../../config/authConfig.js';
import { ConfigType } from '@nestjs/config';


@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @InjectModel(UserEntity.name) private userModel: Model<UserDocument>,
        @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>
    ) { }

    private async generateHash(password: string): Promise<string> {
        const salt: string = await bcrypt.genSalt(this.config.round);
        return await bcrypt.hash(password, salt);
    }

    async create(user: User): Promise<void> {
        const { userId, userName, password } = user;
        const userDto = {
            userId: userId,
            userName: userName,
            password: await this.generateHash(password)
        }
        const createdUser = new this.userModel(userDto);
        createdUser.save();
    }

    async update(userId: string, userName?: string, password?: string): Promise<void> {
        let user: UserDocument = await this.userModel.findOne({userId: userId});

        if (password != undefined)
            user.password = await this.generateHash(password);
            
        if (userName != undefined)
            user.userName = userName

        // if ('password' in dto)
        //  delete dto.key
        // for (const key of Object.keys(dto))
        //     user[key] = dto[key];

        user.save();

    }
    async delete(userId: string): Promise<void> {
        await this.userModel.deleteOne({userId: userId});
    }
    
    async findByUserId(userId: string): Promise<User | null> {
        let userEntity: UserEntity | null = await this.userModel.findOne({userId: userId});

        if (userEntity == null)
            return null;

        return new User(userEntity.userId, userEntity.userName, userEntity.password);
    
    }
    
    async findByObjectId(objectId: ObjectId): Promise<User | null> {
        let userEntity: UserEntity | null = await this.userModel.findOne({_id: objectId});

        if (userEntity == null)
            return null;

        return new User(userEntity.userId, userEntity.userName, userEntity.password);

    }

}