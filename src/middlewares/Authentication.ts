import { NextFunction, Request, Response } from 'express';
import { JWTToken } from '../utils/Token';
import { extractCookie } from './Cookies';

/**
 * Secure access to data and path that requires creatives to be authenticated.
 *
 * Use cookie authentication or headers if cookies are missing
 * during sign in, cookies sent to the client are expected to be sent as a payload on all subsequent requests.
 *
 *
 * A fallback to header authentication will be used when no cookies are found in a request,
 * missing cookies and authentication headers will cause a reject to the incoming request
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {(Promise<void | Response>)}
 */
export async function secureUserAccount(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    const authvalue = (extractCookie(req.headers.cookie, 'token') as string) || req.headers['authorization'].toString().split(' ')[1];

    if (authvalue) {
        const decoded = JWTToken.verify(authvalue);
        if (decoded['account']) {
            return next();
        }

        return res.status(403).json({ error: 'forbidden' });
    }

    return res.status(403).json({ error: 'forbidden' });
}
