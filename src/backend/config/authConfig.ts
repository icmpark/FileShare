import { registerAs } from "@nestjs/config";

export default registerAs('auth', () => ({
    secret_key: 'SECRETKEY',
    refresh_expiresIn: '1d',
    expiresIn: '1h',
    audience: 'localhost:3000',
    issuer: 'localhost:3000',
    salt: 'SALT',
    round: 10
}));


