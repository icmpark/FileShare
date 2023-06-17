import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


export type AuthDocument = AuthEntity & Document;

@Schema()
export class AuthEntity {
    @Prop({type: String, index: true, unique: true})
    userId: string;

    @Prop(String)
    refreshToken: string;
}

export const AuthSchema = SchemaFactory.createForClass(AuthEntity);