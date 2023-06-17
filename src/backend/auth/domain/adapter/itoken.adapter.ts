import { TokenPayload } from "../token-payload";

export interface ITokenAdapter {
    extractFromReq: (request: any) => string;
    create: (tokenPayload: TokenPayload, expiresIn: string) => string;
    verify: (token: string) => TokenPayload | null;
}