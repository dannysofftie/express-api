import { NextFunction, Request, Response } from 'express';
import Token from '../utilities/Token';
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
export async function secureCreative(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    const authvalue = (extractCookie(req.headers.cookie, 'user-cookie-name') as string) || req.headers['authorization'].toString().split(' ')[1];

    if (authvalue) {
        const decoded = Token.verify(authvalue);
        if (decoded['account'] === 'creative') {
            return next();
        }

        // @ts-ignore
        if (!req.ajax) {
            return res.redirect(301, '/?utm_source=authentication-redirect');
        }

        return res.status(403).json({ error: 'forbidden' });
    }

    // @ts-ignore
    if (!req.ajax) {
        return res.redirect(301, '/?utm_source=authentication-redirect');
    }

    return res.status(403).json({ error: 'forbidden' });
}
