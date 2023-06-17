import { Inject, Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { FileCreatedEvent } from "./event/file-create.event";
import { FileUpdatedEvent } from "./event/file-update.event";
import { FileDeletedEvent } from "./event/file-delete.event";
import { FileInfo } from "./file";
import { IFileRepository } from "./repository/ifile.repository";

@Injectable()
export class FileFactory {
    constructor (
        @Inject('FileRepository') private fileRepository: IFileRepository,
        private eventBus: EventBus
    ) {}

    async create(
        fileId: string,
        uploadUserId: string,
        title: string,
        description: string,
        files: File[]
    ): Promise<FileInfo> {
        const [filePath, fileName, previewPath] = await this.fileRepository.save(fileId, title, files);
        const file = new FileInfo(
            fileId,
            uploadUserId,
            title,
            description,
            fileName,
            filePath,
            0,
            previewPath
        );
        await this.fileRepository.create(file);
        this.eventBus.publish(new FileCreatedEvent(file));
        return file;
    }

    
    async update(
        fileId: string,
        title: string,
        description: string,
        files: File[],
        likeUser: string,
        disLikeUser: string
    ): Promise<void> { 
        
        let [filePath, fileName, previewPath] = [undefined, undefined, []];

        if ((files ?? false) ? files.length != 0 : false)
            [filePath, fileName, previewPath] = await this.fileRepository.save(fileId, title, files);

        await this.fileRepository.update(
            fileId,
            title,
            description,
            fileName,
            filePath,
            previewPath,
            likeUser,
            disLikeUser
        );
        
        this.eventBus.publish(new FileUpdatedEvent(
            fileId,
            title,
            description,
            fileName,
            filePath,
            previewPath,
            likeUser,
            disLikeUser
        ));
    }

    async delete (fileIds: string[]): Promise<void> {
        await this.fileRepository.delete(fileIds);
        this.eventBus.publish(new FileDeletedEvent(fileIds));
    }

    reconstitute(
        fileId: string,
        uploadUserId: string,
        title: string,
        description: string,
        fileName: string,
        filePath: string,
        likes: number,
        previewPath: string[]
    ): FileInfo {

        const file = new FileInfo(
            fileId,
            uploadUserId,
            title,
            description,
            fileName,
            filePath,
            likes,
            previewPath
        );
        return file;
    }


}