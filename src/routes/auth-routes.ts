import { Request, Response } from 'express';
import { Document } from 'mongoose';
import AbstractRouter from '../abstracts/Router';
import { compareSync } from 'bcrypt';
import { extractCookie } from '../middlewares';
import { USER_1_COOKIE, USER_2_COOKIE } from '../configs';
import SampleController from '../controllers/SampleController';
import Token from '../utilities/Token';

/**
 * Data placeholders for returned matches during sign in.
 *
 * @interface IAuth
 */
interface IAuth {
    user: string;
    cookie: string;
    password: string;
    error: string;
}

/**
 * Handles user authentication
 *
 * @class AuthRoutes
 * @extends {AbstractRouter}
 */
class AuthRoutes extends AbstractRouter {
    /**
     * Creates an instance of AuthRoutes.
     * @memberof AuthRoutes
     */
    constructor() {
        super();
        this.routeHandler();
        this.rejectHandler();
    }

    /**
     * Handles authentication requests and forwards to relevant controllers
     *
     * @protected
     * @memberof AuthRoutes
     */
    protected routeHandler(): void {
        this.router.post('/signin', async (req, res) => {
            const request = req.headers['X-Requested-With'] || req.headers['content-type'] === 'application/json';

            /**
             * Handle authentication into the platform and set appropriate authentication cookies
             *
             * @param {Request} req - incoming request object
             * @param {Response} res - outgoing response object
             * @returns {Promise<IAuth>}
             */
            // tslint:disable-next-line:no-shadowed-variable
            async function authenticateSignIn(req: Request, res: Response): Promise<IAuth | any | Response> {
                const data: IAuth = {
                    user: null,
                    cookie: null,
                    password: null,
                    error: null,
                };

                const assign = (options: { cookie: string; user: string; data: Document }) => {
                    data['user'] = options.user;
                    data['cookie'] = options.cookie;
                    data['password'] = options.data['password'];
                };

                const user: Document[] = (await new SampleController(req, res).findOneEntry(true)) as Document[];

                if (user.length) {
                    let value = '';
                    if (user[0]['account'] === 'user-1') {
                        value = USER_1_COOKIE;
                    }
                    if (user[0]['account'] === 'user-1') {
                        value = USER_2_COOKIE;
                    }
                    assign({ cookie: value, user: user[0]['account'], data: user[0] });
                } else {
                    return data;
                }

                return data;
            }

            const match = (await authenticateSignIn(req, res)) as any;

            if (!match.user) {
                if (!request) {
                    return res.redirect(301, '/?utm_source=authentication-redirect');
                }

                return res.status(200).json({ message: 'error', token: null });
            }
            if (!compareSync(req.body['password'], match.password)) {
                if (!request) {
                    return res.redirect(301, '/?utm_source=authentication-redirect');
                }

                return res.status(200).json({ message: 'error', token: null });
            }

            const cookies: {} = extractCookie(req.headers.cookie) as {};
            for (const cookie in cookies) {
                if (cookie.startsWith(USER_1_COOKIE.slice(0, 3) || 'token')) {
                    res.clearCookie(cookie);
                }
            }

            const payload = {
                email: req.body['email'],
                account: match['user'],
                password: req.body['password'],
            };

            const token = Token.sign(payload);

            res.cookie(match.cookie, token, { maxAge: 1000 * 60 * 60 * 24 * 365 });

            if (request) {
                return res.status(200).json({ message: 'success', user: match['user'], token });
            }

            // find a way to handle redirection when request did not originate from xmlhttprequest source
            return res.status(200).json({ message: 'success', user: match['user'], token });
        });
    }

    /**
     * Unhandled route requests to authentication will be rejected automatically
     *
     * @protected
     * @memberof AuthRoutes
     */
    protected rejectHandler(): void {
        this.router.all('*', (req, res) => {
            res.status(404).json({ error: `Unhandled ${req.method} endpoint` });
        });
    }
}

module.exports = new AuthRoutes().route();
