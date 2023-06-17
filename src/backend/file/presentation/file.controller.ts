import { Controller, Param, Query, Body, Post, Get, UseGuards, UseInterceptors, Bind, UploadedFiles, Response, StreamableFile, BadRequestException, Inject, Put, Delete, Patch } from '@nestjs/common';
import { CACHE_MANAGER, CacheKey } from '@nestjs/cache-manager';
import { Auth } from '../../utils/deco/auth';
import { CreateFileDto } from './dto/create-file.dto'
import { fileMulConfig } from '../../config/fileConfig';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SearchFileDto } from './dto/search-file.dto';
import { FileGuard, Roles } from './guard/file-guard';
import { FileExisted } from './pipe/file-existed';
import { UpdateFileDto } from './dto/update-file.dto';
import { HttpCacheInterceptor } from '../../utils/intercepter/cache-intercepter';
import { Cache } from 'cache-manager';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateFileCommand } from '../application/command/create-file.command';
import { FileInfo } from '../domain/file';
import { SearchFileQuery } from '../application/query/search-file.query';
import { UpdateFileCommand } from '../application/command/update-file.command';
import { DeleteFileCommand } from '../application/command/delete-file.command';
import { DownloadFileQuery } from '../application/query/download-file.query';
import { CacheResetIntercepter } from '../../utils/intercepter/cache-reset-intercepter';
import { ParamAuth } from './deco/param-auth';
import { FileLiked } from './pipe/file-liked';
import { FindFileQuery } from '../application/query/find-file.query';

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
        @Auth('userId') userId: string,
        @Body() dto: CreateFileDto
    ): Promise<{[key: string]: string}> {
        if(files.length == 0)
            throw new BadRequestException({"message": "No files!"});
        const { title, description } = dto;
        const command = new CreateFileCommand(files, userId, title, description);
        const fileId = await this.commandBus.execute(command);
        return {created: fileId};
    }

    @UseInterceptors(HttpCacheInterceptor)
    @CacheKey('FileSearch')
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
            title: fileInfo.title,
            description: fileInfo.description,
            likes: fileInfo.likes,
            previewPath: fileInfo.previewPath.length,
        };
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
