export class Auth {
    constructor(
        readonly userId: string,
        readonly refreshToken: string
    ) { }
  }