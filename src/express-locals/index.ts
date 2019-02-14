/**
 * Application level locals.
 *
 * Locals defined by these methods will be rendered by ejs templating engine as data variables.
 *
 *  - e.g `{ username: 'example-username' }`
 *  - Accessed from ejs as `<%= username %>`
 *
 * Defined in the form of, `shortcut` : `method to execute`
 *
 * The method to execute for each shortcut must have the following properties:
 *  - Must be a singleton,
 *  - Must return typeof `string`, `number`, or `undefined`
 *
 * Methods that return typeof `object` will be declined.
 */
import { Request, Response } from 'express';
import { extractCookie } from '../middlewares';

/**
 * Check if there is a user logged in, and allow then access their profiles / dashboard.
 *
 * @param {Request} req - incoming request object
 * @returns
 */
export async function checkAuthenticatedUser(req: Request) {
    const cookies: string[] = Object.keys(extractCookie(req.headers.cookie));
    let authvalue = '';
    cookies.forEach((cookie) => {
        if (cookie.includes('pvt-')) {
            authvalue = extractCookie(req.headers.cookie, cookie) as string;
        }
    });

    if (!authvalue) {
        // @ts-ignore
        return { loggedin: false, returnurl: req.fullUrl, account: null };
    }

    // @ts-ignore
    return { loggedin: true, username: match[0]['username'], path: redirecturl, account: match[0]['account'], returnurl: req.fullUrl };
}

/**
 * Resolve functions that return variables passed when rendering views.
 *
 * Allow multiple functions to be called, returning a single object for efficiency and simplicity.
 *
 * @param locals - functions to return variables to be rendered as express locals
 * @param req - incoming request object
 * @param res - outgoing message object
 */
// tslint:disable-next-line:ban-types
export async function resolveLocals(locals: Function | Function[], req: Request, res: Response): Promise<object> {
    const result: Array<{}> = [];

    if (typeof locals === 'function') {
        return await locals(req, res);
    }

    for await (const local of locals) {
        // each locals function is expected to return data, in this case data of typeof object
        // functions with no return types will be ignored silently
        result.push(await local(req, res));
    }

    const data: object = {};

    for await (const obj of result) {
        // some functions may not return an object,
        // handle non-object return types
        typeof obj === 'object' && Object.keys(obj).forEach((key) => (data[key] = obj[key]));
    }

    return data;
}
