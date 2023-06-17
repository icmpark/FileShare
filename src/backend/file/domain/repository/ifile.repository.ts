import { StreamableFile } from '@nestjs/common';
import { FileInfo } from '../file';

export interface IFileRepository {
    create: (
        file: FileInfo
    ) => Promise<void>;
    delete: (
        fileIds: string[]
    ) => Promise<void>;
    update: (
        fileId: string,
        title: string,
        description: string,
        fileName: string,
        filePath: string
    ) => Promise<void>;
    save: (
        fileId: string,
        title: string,
        files: File[]
    ) => Promise<string[]>;
    find: (
        fileId: string
    ) => Promise<FileInfo>;
    search: (
        title: string,
        userId: string,
        offset:number,
        limit: number
    ) => Promise<FileInfo[]>;
    download: (
        fileId: string
    ) => Promise<(StreamableFile | string)[]>;
}