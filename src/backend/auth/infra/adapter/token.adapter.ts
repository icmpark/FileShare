import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import authConfig from '../../../config/authConfig';
import { ITokenAdapter } from '../../domain/adapter/itoken.adapter';
import { TokenPayload } from '../../domain/token-payload';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokenAdapter implements ITokenAdapter {
    constructor(
        @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
    ) { }

    extractFromReq(request: any): string {
        if (!('authorization' in request.headers))
            return null;
            
        if (!request.headers.authorization.includes('Bearer '))
            return null;

        const jwtString = request.headers.authorization.split('Bearer ')[1];

        return jwtString
    }

    create (tokenPayload: TokenPayload, expiresIn: string): string {
        const { userId, tokenType } = tokenPayload;

        const payload = { userId: userId, tokenType: tokenType };

        const token = jwt.sign(payload, this.config.secret_key, {
            expiresIn: expiresIn,
            audience: this.config.audience,
            issuer: this.config.issuer,
        });

        return token;
    }

    verify (token: string): TokenPayload {
        try {
            const payload = jwt.verify(token, this.config.secret_key) as (jwt.JwtPayload | string) & {[name: string]: string};
            const { userId, tokenType } = payload;
            const tokenPayload = new TokenPayload(userId, tokenType);
            return tokenPayload;
        } catch (e) {
            return null;
        }
    }

}