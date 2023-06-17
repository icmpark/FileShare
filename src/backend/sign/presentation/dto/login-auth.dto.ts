import { IsString, Matches } from "class-validator";

export class LoginAuthDto {
    @IsString()
    readonly userId: string;

    @IsString()
    @Matches(/^[A-Za-z\d!@#$%^&*()]{8,30}$/)
    readonly password: string;
}

