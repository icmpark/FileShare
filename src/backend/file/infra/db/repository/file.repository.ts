import { Inject, StreamableFile } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FileInfo } from '../../../domain/file';
import * as fs from 'fs';
import * as archiver from 'archiver';
import { ConfigType } from '@nestjs/config';
import { FileEntity, FileDocument } from '../entity/file-entity';
import { Model } from 'mongoose';
import fileConfig from '../../../../config/fileConfig';
import { regexEscape } from '../../../../utils/func/regex-escape';

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
        const filePaths: string[] = fileEntitys.map((fileEntity: FileEntity) => fileEntity.filePath);
        this.deleteTargetFile(filePaths);
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

    async save(
        fileId: string,
        title: string,
        files: File[]
    ): Promise<[string, string, string[]]> {
        if (!fs.existsSync(this.config.uploadPath))
            fs.mkdirSync(this.config.uploadPath);

        if (files.length == 1)
        {
            const [ file ]: any[] = files;
            fs.copyFile(file.path, this.config.uploadPath + file.filename, (err) => {
                fs.unlink(file.path, (err) => {});
            });
            return [file.filename, file.originalname, []];
        }
        else
        {
            let toZ = fs.createWriteStream(this.config.uploadPath + fileId);
            let fromZ = archiver('zip');
            
            for (const { originalname, path } of (files as any))
                fromZ.append(
                    fs.createReadStream(path),
                    { name: originalname }
                );

            fromZ.pipe(toZ);
            await fromZ.finalize();
    
            for (const { path } of (files as any)) 
                if(fs.existsSync(path))
                    fs.unlinkSync(path);

            return [fileId, title + '.zip', []];
        }
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
        offset:number,
        limit: number
    ): Promise<FileInfo[]> {

        const query: {[name: string]: any} = {};
        
        if (userId != undefined)
            query['uploadUserId'] = userId;

        if (title != undefined)
            query['title'] = { $regex: regexEscape(title) };
        
        let aggregateQuery = this.fileModel
            .aggregate()
            .match(query)
            .project({
                fileId: 1,
                uploadUserId: 1,
                title: 1,
                description: 1,
                fileName: 1,
                filePath: 1,      
                previewPath: 1,    
                titleLen: { $strLenCP: '$title' }
            })
            .sort({titleLen: 1, title: 1})
            .project({titleLen: 0, likeUsers: 0})
            .skip(offset);

        if (limit != undefined)
            aggregateQuery = aggregateQuery.limit(limit);
            
        return (await aggregateQuery).map((value: {[key: string]: any}): FileInfo => {
            return new FileInfo(
                value.fileId,
                value.uploadUserId,
                value.title,
                value.description,
                value.fileName,
                value.filePath,
                value.likes,
                value.previewPath
            );
        });
    }

    async download(
        fileId: string
    ): Promise<(StreamableFile | string)[]> {        
        const {filePath, fileName} = await this.fileModel.findOne({fileId: fileId});
        const file = fs.createReadStream(this.config.uploadPath + filePath);
        return [new StreamableFile(file), fileName];

    }
}