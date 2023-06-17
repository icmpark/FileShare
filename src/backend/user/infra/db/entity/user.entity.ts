import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = UserEntity & Document;

@Schema()
export class UserEntity {
    @Prop({type: String, index: true, unique: true})
    userId: string;
    @Prop(String)
    userName: string;
    @Prop(String)
    password: string;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);