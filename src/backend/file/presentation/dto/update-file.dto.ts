import { IsBoolean, IsOptional, IsString, IsArray, Validate } from "class-validator"

export class UpdateFileDto {
    @IsString()
    @IsOptional()
    readonly title: string;

    @IsString()
    @IsOptional()
    readonly description: string;
}