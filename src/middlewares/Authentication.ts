import { NextFunction, Request, Response } from 'express';
import { Document, Types } from 'mongoose';
import { extractCookie } from './Cookies';
import Sample from '../models/SampleModel';
import { USER_1_COOKIE } from '../configs';

async function matchUsernameAuthCookie(options: { username: string; cookie: string; type: string }, res: Response, next: NextFunction): Promise<void | Response> {
    const username = options.username;
    const authCookie = Types.ObjectId(options.cookie);
    const userType = options.type;

    const criteria = !username ? { _id: authCookie } : { _id: authCookie, username };

    const match = (await Sample.aggregate([
        {
            $match: { ...criteria },
        },
    ])) as Document[];

    if (match.length) {
        if (match[0]['_id'].toString() === authCookie.toString() && userType === match[0]['account']) {
            return next();
        }
        return res.redirect('/logout?m=wrong-authentication-credentials');
    }
    return res.redirect('/logout?m=wrong-authentication-credentials');
}

/**
 * Secure requests to be authenticated.
 *
 * Use cookie authentication or headers if cookies are missing
 * during sign in, cookies sent to the client are expected to be sent as a payload.
 *
 *
 * A fallback to header authentication will be used when no cookies are found,
 * missing cookies and authentication headers will cause a rejection to the incoming request
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {(Promise<void | Response>)}
 */
export async function securePlatformFreelancers(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    let authvalue: string = extractCookie(req.headers.cookie, USER_1_COOKIE) as string;
    if (!authvalue) {
        // incoming authentication header value is expected to be in the form
        // {USER_1_COOKIE: 'Authenticate header-value-as-read-from-cookies'}

        // header USER_1_COOKIE might be missing therefore handle this error before it occurs
        try {
            authvalue = req.headers[USER_1_COOKIE].toString().split(' ')[1];
            // tslint:disable-next-line:no-empty
        } catch {}
    }
    if (authvalue) {
        return await matchUsernameAuthCookie({ username: req.params['username'], cookie: authvalue, type: 'type' }, res, next);
    }

    return res.redirect('/login?m=auth-failed');
}
