import { IsString, IsArray, IsNumber, Validate } from "class-validator"
import { Type } from 'class-transformer';

export class SearchFileDto {
    @IsString()
    readonly title: string;

    @IsNumber()
    @Type(() => Number)
    readonly offset: number;

    @IsNumber()
    @Type(() => Number)
    readonly limit: number;
}