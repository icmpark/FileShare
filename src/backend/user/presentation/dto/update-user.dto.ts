import { IsString, IsOptional, Matches } from "class-validator";
import { Same } from "./same-pass";
import { SimReq } from "./sim-request";

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    readonly userName: string;

    @IsString()
    @Matches(/^[A-Za-z\d!@#$%^&*()]{8,30}$/)
    @IsOptional()
    readonly password: string;
}