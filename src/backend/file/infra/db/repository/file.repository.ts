import { Inject, StreamableFile } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FileInfo } from '../../../domain/file.js';
import fs from 'fs';
import { ConfigType } from '@nestjs/config';
import { FileEntity, FileDocument } from '../entity/file-entity.js';
import { Model } from 'mongoose';
import fileConfig from '../../../../config/fileConfig.js';
import { regexEscape } from '../../../../utils/func/regex-escape.js';
import { saveFile } from '../../procfile/converter.js';

export class FileRepository {
    constructor (
        @Inject(fileConfig.KEY) private config: ConfigType<typeof fileConfig>,
        @InjectModel(FileEntity.name) private fileModel: Model<FileDocument>
    ) {}


    async create(file: FileInfo): Promise<void> {
        const fileDto: FileEntity = {
            fileId: file.fileId,
            uploadUserId: file.uploadUserId,
            title: file.title,
            description: file.description,
            fileName: file.fileName,
            filePath: file.filePath,
            previewPath: file.previewPath,
            likeUsers: [],
        };
        const fileDocument: FileDocument = new this.fileModel(fileDto);
        fileDocument.save();
    }
    
    private deleteTargetFile(filePaths: string[]): void {
        for (const filePath of filePaths)
            fs.unlink(this.config.uploadPath + filePath, () => {});
    }

    private deletePreviewFile(filePaths: string[]): void {
        for (const filePath of filePaths)
            fs.unlink(this.config.previewPath + filePath, () => {});
    }

    async delete(
        fileIds: string[]
    ): Promise<void> {
        const fileEntitys: FileEntity[] = await this.fileModel.find({ fileId: { $in: fileIds }});
        if (fileEntitys.length === 0)
            return;        

        this.deleteTargetFile(fileEntitys.map((fileEntity: FileEntity) => fileEntity.filePath));
        fileEntitys.forEach((fileEntity: FileEntity) => this.deletePreviewFile(fileEntity.previewPath));

        await this.fileModel.deleteMany({ fileId: { $in: fileIds }});
    }

    async update(
        fileId: string,
        title: string,
        description: string,
        fileName: string,
        filePath: string,
        previewPath: string[],
        likeUser: string,
        disLikeUser: string
    ): Promise<void> {

        if (likeUser != undefined)
        {
            this.userLike(fileId, likeUser);
            return;
        }

        if (disLikeUser != undefined)
        {
            this.userDisLike(fileId, disLikeUser);
            return;
        }


        const fileDocument: FileDocument = await this.fileModel.findOne({fileId: fileId});

        if (title != undefined)
            fileDocument.title = title;
        
        if (description != undefined)
            fileDocument.description = description;
        
        if (fileName != undefined)
            fileDocument.fileName = fileName;
        
        if (filePath != undefined)
        {
            this.deleteTargetFile([fileDocument.filePath]);
            this.deletePreviewFile(fileDocument.previewPath);
            fileDocument.filePath = filePath;
            fileDocument.previewPath = previewPath;
        }

        fileDocument.save();
    }

    async isUserLike(fileId: string, userId: string): Promise<boolean> {
        const docCounts: number = await this.fileModel.count({
            fileId: fileId,
            likeUsers: {$all: userId}
        });
        return docCounts > 0;
    }

    async userLike(fileId: string, userId: string): Promise<boolean> {
        const result = await this.fileModel.updateOne(
            {fileId: fileId, likeUsers: {$ne: userId}},
            {$push: {likeUsers: userId}}
        );
        return result.modifiedCount > 0;
    }

    async userDisLike(fileId: string, userId: string): Promise<boolean> {
        
        let query: {[key: string]: string} = {likeUsers: userId};

        if (fileId != undefined)
            query.fileId = fileId;

        const result = await this.fileModel.updateMany(
            query,
            {$pull: {likeUsers: userId}}
        );
        return result.modifiedCount > 0;
    }

    private async checkFolder(): Promise<void> {
        const paths = [
            this.config.uploadPath,
            this.config.previewPath,
            this.config.tmpPath,
        ]
        
        await Promise.all(paths.map(async (path: string): Promise<void> => {
            try { await fs.promises.access(path, fs.constants.F_OK) }
            catch { return fs.promises.mkdir(path); }
        }))
    }

    async save(
        fileId: string,
        title: string,
        files: Express.Multer.File[]
    ): Promise<[string, string, string[]]> {
        await this.checkFolder();
        return await saveFile(files, this.config, title);
    }

    
    async find(
        fileId: string
    ): Promise<FileInfo> {
        const fileInfos: FileInfo[] = await this.fileModel
            .aggregate()
            .match({fileId: fileId})
            .project({
                fileId: 1,
                uploadUserId: 1,
                title: 1,
                description: 1,
                fileName: 1,
                filePath: 1,
                previewPath: 1,   
                likes: {$size: '$likeUsers'}
            })
            .project({ likeUsers: 0 });

        if (fileInfos.length == 0)
            return null;

        const result = fileInfos[0];

        return new FileInfo(
            result.fileId,
            result.uploadUserId,
            result.title,
            result.description,
            result.fileName,
            result.filePath,
            result.likes,
            result.previewPath
        );
    }

    async search(
        title: string,
        userId: string,
        offset: number,
        limit: number,
    ): Promise<FileInfo[]> {
        const query: {[name: string]: any} = {};
        
        if (userId != undefined)
            query['uploadUserId'] = userId;

        if (title != undefined)
            query['title'] = { $regex: regexEscape(title) };
        
        let fileDocuments: FileDocument[] = await this.fileModel.find(
                query, 
                {
                    _id: 1,
                    fileId: 1,
                    uploadUserId: 1,
                    title: 1,
                    description: 1,
                }
            ).sort({ _id: -1}).skip(offset).limit(limit);
            
        return fileDocuments.map((value: {[key: string]: any}): FileInfo => {
            return new FileInfo(
                value.fileId,
                value.uploadUserId,
                value.title,
                value.description,
                undefined,
                undefined,
                undefined,
                undefined
            );
        });
    }

    async searchByTitle(
        title: string,
        offset: number,
        limit: number,
    ): Promise<string[]> {
        let aggregateQuery = await this.fileModel
            .aggregate()
            .match({'title': { $regex: '^' + regexEscape(title) }})
            .group({ _id: '$title' })
            .project({ "_id": 1, "len": { $strLenCP: "$_id" } })
            .sort({ len: 1, _id: 1})
            .project({len: 0})
            .skip(offset)
            .limit(limit);
            
        return aggregateQuery.map((value: {[key: string]: any}): string => {
            return value._id;
        });
    }

    async download(
        fileId: string
    ): Promise<(StreamableFile | string)[]> {        
        const {filePath, fileName} = await this.fileModel.findOne({fileId: fileId});
        const file = fs.createReadStream(this.config.uploadPath + filePath);
        return [new StreamableFile(file), fileName];

    }

    async getPreviewFile(
        fileId: string,
        previewId: number
    ): Promise<(StreamableFile | string)[]> {          
        const { previewPath } = await this.fileModel.findOne({fileId: fileId});
        const file = fs.createReadStream(this.config.previewPath + previewPath[previewId]);
        return [new StreamableFile(file), previewId + '.jpg'];

    }
}