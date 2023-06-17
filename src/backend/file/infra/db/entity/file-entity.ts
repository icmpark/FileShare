import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


export type FileDocument = FileEntity & Document;

@Schema()
export class FileEntity {
    @Prop({type: String, index: true, unique: true})
    fileId: string;

    @Prop({type: String, index: true})
    uploadUserId: string;

    @Prop({type: [String], index: true})
    likeUsers: string[];

    @Prop({type: [String]})
    previewPath: string[];

    @Prop(String)
    title: string;

    @Prop(String)
    description: string;

    @Prop(String)
    fileName: string;

    @Prop(String)
    filePath: string;
}

export const FileSchema = SchemaFactory.createForClass(FileEntity);