import { StreamableFile } from '@nestjs/common';
import { FileInfo } from '../file.js';

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
        filePath: string,
        previewPath: string[],
        likeUser: string,
        disLikeUser: string
    ) => Promise<void>;
    save: (
        fileId: string,
        title: string,
        files: File[]
    ) => Promise<[string, string, string[]]>;
    find: (
        fileId: string
    ) => Promise<FileInfo>;
    search: (
        title: string,
        userId: string,
        offset:number,
        limit: number
    ) => Promise<FileInfo[]>;
    searchByTitle: (
        title: string,
        offset:number,
        limit: number
    ) => Promise<string[]>;
    download: (
        fileId: string
    ) => Promise<(StreamableFile | string)[]>;
    getPreviewFile: (
        fileId: string,
        previewId: number,
    ) => Promise<(StreamableFile | string)[]>;
    isUserLike: (
        fileId: string,
        userId: string
    ) => Promise<boolean>;
    userLike: (
        fileId: string,
        userId: string
    ) => Promise<boolean>;
    userDisLike: (
        fileId: string,
        userId: string
    ) => Promise<boolean>;
}