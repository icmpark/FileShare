import { IsString, Matches } from "class-validator";

export class CreateUserDto {
    @IsString()
    readonly userName: string;

    @IsString()
    @Matches(/^[A-Za-z\d!@#$%^&*()]{8,30}$/)
    readonly password: string;
}