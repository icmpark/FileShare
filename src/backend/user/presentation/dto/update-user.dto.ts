import { IsString, IsOptional, Matches } from "class-validator";

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    readonly userName: string;

    @IsString()
    @Matches(/^[A-Za-z\d!@#$%^&*()]{8,30}$/)
    @IsOptional()
    readonly password: string;
}