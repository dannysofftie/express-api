import { Request } from 'express';
import { readFileSync } from 'fs';
import * as jwt from 'jsonwebtoken';
import { join } from 'path';

/**
 * Payload expected by JWT's sign token function.
 *
 * @interface IJWTPayload
 */
interface IJWTPayload {
    email: string;
    password: string;
    account: string;
}

/**
 * JWT sign options
 *
 * @param algorithm
 * @param expiresIn
 */
const jwtSignOptions: jwt.SignOptions = {
    algorithm: 'RS256',
    expiresIn: 86400 * 365,
};

const jwtVerifyOptions: jwt.VerifyOptions = {
    algorithms: ['RS256'],
};

/**
 * JWT tokens signing, verification and decoding utility.
 *
 * @export
 * @class Token
 */
export default class Token {
    /**
     * Sign and issue a token for subsequent requests authentication
     *
     * @static
     * @param {Request} request
     * @returns
     * @memberof Token
     */
    public static sign(options: IJWTPayload) {
        new this();
        const { email, password, account }: IJWTPayload = options;

        if (!email || !password || !account) {
            throw new Error('Expects email, account type and password in payload.');
        }

        return jwt.sign({ email, password, account }, Token.pvtkey, jwtSignOptions);
    }

    /**
     * Verify issued token.
     *
     * Expects header
     *  - `Authorization: Bearer <token>`
     *
     * @static
     * @param {Request} request
     * @memberof Token
     */
    public static verify(token: string) {
        new this();
        return jwt.verify(token, Token.pubkey, jwtVerifyOptions);
    }

    /**
     * Decode and obtain tokens payload.
     *
     * Expects header
     *  - `Authorization: Bearer <token>`
     *
     * @static
     * @param {Request} request
     * @memberof Token
     */
    public static decode(token: string) {
        new this();
        return jwt.decode(token);
    }

    /**
     * Public key to be used in verifying and decoding JWT tokens.
     *
     * @private
     * @static
     * @type {Buffer}
     * @memberof Token
     */
    private static pubkey: Buffer;

    /**
     * Private key for signing JWT tokens
     *
     * @private
     * @static
     * @type {Buffer}
     * @memberof Token
     */
    private static pvtkey: Buffer;

    constructor() {
        // how to generate private key and public key pair for use
        // in signing, verifying and decoding jwt tokens
        // ssh-keygen -t rsa -P "" -b 4096 -m PEM -f jwtRS256.key
        // generate corresponding public jey
        // openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub

        Token.pvtkey = readFileSync(join(__dirname, '..', '..', 'config', 'jwtRS256.key'));
        Token.pubkey = readFileSync(join(__dirname, '..', '..', 'config', 'jwtRS256.key.pub'));
    }
}