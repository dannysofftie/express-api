import { NextFunction, Request, Response } from 'express';
import { Document, Types } from 'mongoose';
import Platformuser from '../models/Platformuser';
import { extractCookie } from './Cookies';

async function matchUsernameAuthCookie(options: { username: string; cookie: string; type: string }, res: Response, next: NextFunction): Promise<void | Response> {
    const username = options.username;
    const authCookie = Types.ObjectId(options.cookie);
    const userType = options.type;

    const criteria = !username ? { _id: authCookie } : { _id: authCookie, username };

    const match = (await Platformuser.aggregate([
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
 * Secure access to client data, to only authenticated requests
 *
 * Use cookie authentication or headers if cookies are missing
 * during sign in, cookies sent to the client are expected to be sent as a payload on all subsequent requests
 *
 * A fallback to header authentication will be used when no cookies are found in a request,
 * Missing cookies and authentication headers will cause a rejection to the incoming request
 *
 * @export
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {NextFunction} next application level next function, to pass execution when expected criteria is met
 * @returns {(Promise<void | Response>)}
 */
export async function securePlatformClients(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    let authvalue: string = extractCookie(req.headers.cookie, 'pvt-cl-ssid') as string;
    if (!authvalue) {
        // incoming authentication header value is expected to be in the form
        // {'pvt-s-ssid': 'Authenticate header-value-as-read-from-cookies'}

        // header 'pvt-s-ssid' might be missing therefore handle this error before it occurs
        try {
            authvalue = req.headers['pvt-cl-ssid'].toString().split(' ')[1];
            // tslint:disable-next-line:no-empty
        } catch {}
    }
    if (authvalue) {
        return await matchUsernameAuthCookie({ username: req.params['username'], cookie: authvalue, type: 'client' }, res, next);
    }
    return res.redirect('/login?m=auth-failed');
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
    let authvalue: string = extractCookie(req.headers.cookie, 'pvt-fr-ssid') as string;
    if (!authvalue) {
        // incoming authentication header value is expected to be in the form
        // {'pvt-fr-ssid': 'Authenticate header-value-as-read-from-cookies'}

        // header 'pvt-fr-ssid' might be missing therefore handle this error before it occurs
        try {
            authvalue = req.headers['pvt-fr-ssid'].toString().split(' ')[1];
            // tslint:disable-next-line:no-empty
        } catch {}
    }
    if (authvalue) {
        return await matchUsernameAuthCookie({ username: req.params['username'], cookie: authvalue, type: 'freelancer' }, res, next);
    }

    return res.redirect('/login?m=auth-failed');
}

/**
 * Secure profile setup when account is unknown.
 *
 * Use cookie authentication or headers if cookies are missing
 * during sign in, cookies sent to the client are expected to be sent as a payload per every request.
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
export async function secureProfileSetup(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    let authvalue: string = extractCookie(req.headers.cookie, 'pvt-profile') as string;
    if (!authvalue) {
        // incoming authentication header value is expected to be in the form
        // {'pvt-profile': 'Authenticate header-value-as-read-from-cookies'}

        // header 'pvt-profile' might be missing therefore handle this error before it occurs
        try {
            authvalue = req.headers['pvt-profile'].toString().split(' ')[1];
            // tslint:disable-next-line:no-empty
        } catch {}
    }

    if (authvalue) {
        return next();
    }
    return res.redirect('/login?m=auth-failed');
}

/**
 * Secure any user when account is unknown or known.
 *
 * Use cookie authentication or headers if cookies are missing
 * during sign in, cookies sent to the client are expected to be sent as a payload per every request.
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
export async function allowAuthenticatedUser(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    const lu = (value: string) => extractCookie(req.headers.cookie, value);

    let authvalue = lu('pvt-profile') ? lu('pvt-profile') : lu('pvt-fr-ssid') ? lu('pvt-fr-ssid') : lu('pvt-cl-ssid');

    if (!authvalue) {
        // incoming authentication header value is expected to be in the form
        // {'pvt-profile': 'Authenticate header-value-as-read-from-cookies'}
        const header = req.headers['pvt-profile'] ? req.headers['pvt-profile'] : req.headers['pvt-fr-ssid'] ? req.headers['pvt-fr-ssid'] : req.headers['pvt-cl-ssid'];
        // header 'pvt-profile' might be missing therefore handle this error before it occurs
        try {
            authvalue = header.toString().split(' ')[1];
            // tslint:disable-next-line:no-empty
        } catch {}
    }

    if (authvalue) {
        return next();
    }
    return res.redirect('/login?m=auth-failed');
}

/**
 * Secure platform administrators.
 *
 * Use cookie authentication or headers if cookies are missing
 * during sign in, cookies sent to the client are expected to be sent as a payload per every request.
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
export async function securePlatformAdministrators(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    let authvalue: string = extractCookie(req.headers.cookie, 'pvt-adm-ssid') as string;
    if (!authvalue) {
        // incoming authentication header value is expected to be in the form
        // {'pvt-adm-ssid': 'Authenticate header-value-as-read-from-cookies'}

        // header 'pvt-adm-ssid' might be missing therefore handle this error before it occurs
        try {
            authvalue = req.headers['pvt-adm-ssid'].toString().split(' ')[1];
            // tslint:disable-next-line:no-empty
        } catch {}
    }

    if (authvalue) {
        return next();
    }
    return res.redirect('/login?m=auth-failed');
}
