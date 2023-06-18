import { Controller, Param, Query, Body, Post, Get, UseGuards, UseInterceptors, Bind, UploadedFiles, Response, StreamableFile, BadRequestException, Inject, Put, Delete, Patch } from '@nestjs/common';
import { CACHE_MANAGER, CacheKey } from '@nestjs/cache-manager';
import { Auth } from '../../utils/deco/auth.js';
import { CreateFileDto } from './dto/create-file.dto.js'
import { fileMulConfig } from '../../config/fileConfig.js';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SearchFileDto } from './dto/search-file.dto.js';
import { FileGuard, Roles } from './guard/file-guard.js';
import { FileExisted } from './pipe/file-existed.js';
import { UpdateFileDto } from './dto/update-file.dto.js';
import { HttpCacheInterceptor } from '../../utils/intercepter/cache-intercepter.js';
import { Cache } from 'cache-manager';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateFileCommand } from '../application/command/create-file.command.js';
import { FileInfo } from '../domain/file.js';
import { SearchFileQuery } from '../application/query/search-file.query.js';
import { UpdateFileCommand } from '../application/command/update-file.command.js';
import { DeleteFileCommand } from '../application/command/delete-file.command.js';
import { DownloadFileQuery } from '../application/query/download-file.query.js';
import { CacheResetIntercepter } from '../../utils/intercepter/cache-reset-intercepter.js';
import { ParamAuth } from './deco/param-auth.js';
import { FileLiked } from './pipe/file-liked.js';
import { FindFileQuery } from '../application/query/find-file.query.js';
import { v4 } from 'uuid';
import { UserExisted } from '../../user/presentation/pipe/user-existed.pipe.js';
import { ParamPair } from './deco/param-pair.js';
import { PreviewExisted } from './pipe/preview-existed.js';
import { GetPreviewFileQuery } from '../application/query/get-preview-file.query.js';
import { UserLikeFileQuery } from '../application/query/user-like-file.query.js';
import { SearchFileByTitleQuery } from '../application/query/searchby-title.query.js';

@UseGuards(FileGuard)
@Controller('files')
export class FileController {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) { }

    @UseInterceptors(CacheResetIntercepter)
    @CacheKey('FileSearch')
    @Roles('userself')
    @Post('/upload')
    @UseInterceptors(FilesInterceptor('files', null, fileMulConfig))
    @Bind(UploadedFiles())  
    async createFile(
        files: File[],
        @Auth('userId', UserExisted) userId: string,
        @Body() dto: CreateFileDto
    ): Promise<{[key: string]: string}> {
        if(files.length == 0)
            throw new BadRequestException({"message": "No files!"});
        const { title, description } = dto;
        const fileId = v4();
        this.commandBus.execute(new CreateFileCommand(files, userId, fileId, title, description));
        return {created: fileId};
    }

    @Roles('userself')
    @Get('/')
    async searchFile(
        @Query() dto: SearchFileDto
    ): Promise<{[key: string]: string}[]> {

        const {title, offset, limit} = dto;
        const fileInfos: FileInfo[] = await this.queryBus.execute(new SearchFileQuery(
            title,
            offset,
            limit
        ));

        return fileInfos.map((fileInfo: FileInfo): {[key: string]: string} => {
            return {
                fileId: fileInfo.fileId,
                title: fileInfo.title,
                description: fileInfo.description
            };
        });
    }

    @UseInterceptors(HttpCacheInterceptor)
    @CacheKey('FileSearch')
    @Roles('userself')
    @Get('/title')
    async searchByFileName(
        @Query() dto: SearchFileDto
    ): Promise<string[]> {

        const {title, offset, limit} = dto;
        return await this.queryBus.execute(new SearchFileByTitleQuery(
            title,
            offset,
            limit
        ));
    }

    @UseInterceptors(CacheResetIntercepter)
    @CacheKey('FileSearch')
    @Roles('uploader')
    @UseInterceptors(FilesInterceptor('files', null, fileMulConfig))
    @Bind(UploadedFiles())  
    @Patch('/:fileId')
    async updateFile(
        files: File[],
        @Param('fileId', FileExisted) fileId: string,
        @Body() dto: UpdateFileDto
    ): Promise<void> {
        const { title, description } = dto
        const command = new UpdateFileCommand(fileId, files, title, description, undefined, undefined);
        await this.commandBus.execute(command);
    }

    @Roles('userself')
    @Get('/:fileId/like')
    async isUserLikeFile(
        @Param('fileId', FileExisted) fileId: string,
        @Auth('userId') userId: string,
    ): Promise<{[key: string]: boolean}> {
        const query = new UserLikeFileQuery(fileId, userId);
        return {'result': await this.queryBus.execute(query)};
    }

    @Roles('userself')
    @Put('/:fileId/like')
    async userLikeFile(
        @Param('fileId', FileExisted) fileId: string,
        @ParamAuth(['fileId', 'nUserId'], FileLiked) userId: string,
    ): Promise<void> {
        const command = new UpdateFileCommand(fileId, undefined, undefined, undefined, userId, undefined);
        await this.commandBus.execute(command);
    }

    @Roles('userself')
    @Delete('/:fileId/like')
    async userDisLikeFile(
        @Param('fileId', FileExisted) fileId: string,
        @ParamAuth(['fileId', 'userId'], FileLiked) userId: string,
    ): Promise<void> {
        const command = new UpdateFileCommand(fileId, undefined, undefined, undefined, undefined, userId);
        await this.commandBus.execute(command);
    }

    @UseInterceptors(CacheResetIntercepter)
    @CacheKey('FileSearch')
    @Roles('uploader')
    @Delete('/:fileId')
    async deleteFile(
        @Param('fileId', FileExisted) fileId: string
    ): Promise<void> {
        this.commandBus.execute(new DeleteFileCommand(fileId));
    }


    @Roles('userself')
    @Get('/:fileId')
    async getFile(
        @Param('fileId', FileExisted) fileId: string
    ): Promise<{[key: string]: string | number | string[]}> {
        const fileInfo: FileInfo = await this.queryBus.execute(new FindFileQuery(fileId));
        return {
            uploadUserId: fileInfo.uploadUserId,
            fileName: fileInfo.fileName,
            title: fileInfo.title,
            description: fileInfo.description,
            likes: fileInfo.likes,
            previews: fileInfo.previewPath.length,
        };
    }

    @Roles('userself')
    @Get('/:fileId/preview/:previewId')
    async getPreviewFile(
        @Response({ passthrough: true }) res, 
        @ParamPair(['fileId', 'previewId'], PreviewExisted) paramPair: [string, number]
    ): Promise<StreamableFile> {
        const [fileId, previewId] = paramPair
        const query = new GetPreviewFileQuery(fileId, previewId);
        const [file, fileName] = await this.queryBus.execute(query);

        const encodeName = encodeURI(fileName);

        res.set({
            'Content-Type': 'image/jpeg',
            'Content-Disposition': "attachment; filename*=utf-8''" + encodeName + '; filename="' + encodeName + '"'
        });
        return file
    }

    @Roles('userself')
    @Get('/:fileId/download')
    async downloadFile(
        @Response({ passthrough: true }) res, 
        @Param('fileId', FileExisted) fileId: string
    ): Promise<StreamableFile> {
        const [file, fileName] = await this.queryBus.execute(new DownloadFileQuery(fileId));
        const encodeName = encodeURI(fileName);

        res.set({
            // 'Content-Type': 'application/json',
            'Content-Disposition': "attachment; filename*=utf-8''" + encodeName + '; filename="' + encodeName + '"'
        });
        return file
    }
}
