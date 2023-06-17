import { Inject, StreamableFile } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FileInfo } from '../../../domain/file';
import * as fs from 'fs';
import * as archiver from 'archiver';
import { ConfigType } from '@nestjs/config';
import { FileEntity, FileDocument } from '../entity/file-entity';
import { Model } from 'mongoose';
import fileConfig from '../../../../config/fileConfig';
import { FileFactory } from '../../../../file/domain/file.factory';
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
        };
        const fileDocument: FileDocument = new this.fileModel(fileDto);
        fileDocument.save();
    }
    
    private deleteRealFile(filePaths: string[]): void {
        for (const filePath of filePaths)
            fs.unlink(this.config.uploadPath + filePath, () => {});
    }


    async delete(
        fileIds: string[]
    ): Promise<void> {
        const fileEntitys: FileEntity[] = await this.fileModel.find({ fileId: { $in: fileIds }});
        if (fileEntitys.length == 0)
            return;        
        const filePaths: string[] = fileEntitys.map((fileEntity: FileEntity) => fileEntity.filePath);
        this.deleteRealFile(filePaths);
        await this.fileModel.deleteMany({ fileId: { $in: fileIds }});
    }

    async update(
        fileId: string,
        title: string,
        description: string,
        fileName: string,
        filePath: string
    ): Promise<void> {
        const fileDocument: FileDocument = await this.fileModel.findOne({fileId: fileId});

        if (title != undefined)
            fileDocument.title = title;
        
        if (description != undefined)
            fileDocument.description = description;
        
        if (fileName != undefined)
            fileDocument.fileName = fileName;
        
        if (filePath != undefined)
        {
            this.deleteRealFile([fileDocument.filePath]);
            fileDocument.filePath = filePath;
        }
        

        fileDocument.save();
    }
    async save(
        fileId: string,
        title: string,
        files: File[]
    ): Promise<string[]> {
        if (!fs.existsSync(this.config.uploadPath))
            fs.mkdirSync(this.config.uploadPath);

        if (files.length == 1)
        {
            const [ file ]: any[] = files;
            fs.copyFile(file.path, this.config.uploadPath + file.filename, (err) => {
                fs.unlink(file.path, (err) => {});
            });
            return [file.filename, file.originalname];
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

            return [fileId, title + '.zip'];
        }
    }
    async find(
        fileId: string
    ): Promise<FileInfo> {
        const fileEntity: FileEntity = await this.fileModel.findOne({fileId: fileId});
        return new FileInfo(
            fileEntity.fileId,
            fileEntity.uploadUserId,
            fileEntity.title,
            fileEntity.description,
            fileEntity.fileName,
            fileEntity.filePath
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

        const result = await this.fileModel
                                .find(query)
                                .sort({title: 1})
                                .skip(offset)
                                .limit(limit);

        return result.map((value: FileDocument): FileInfo => {
            return new FileInfo(
                value.fileId,
                value.uploadUserId,
                value.title,
                value.description,
                value.fileName,
                value.filePath
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