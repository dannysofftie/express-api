import { Request, Response } from 'express';
import { Document } from 'mongoose';
import AbstractRouter from '../abstracts/Router';
import { compareSync } from 'bcrypt';
import { extractCookie } from '../middlewares';
import { USER_1_COOKIE, USER_2_COOKIE } from '../configs';
import SampleController from '../controllers/SampleController';

/**
 * Data placeholders for returned matches during sign in.
 *
 * @interface IAuth
 */
interface IAuth {
    user: string;
    cookie: string;
    path: string;
    value: string;
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
                    path: null,
                    cookie: null,
                    value: null,
                    password: null,
                    error: null,
                };

                const assign = (options: { cookie: string; path: string; data: Document }) => {
                    data['user'] = options.path;
                    data['cookie'] = options.cookie;
                    data['value'] = options.data['_id'];
                    data['path'] = options.path;
                    data['password'] = options.data['password'];
                    data['username'] = options.data['username'];
                };

                const user: Document[] = (await new SampleController(req, res).findOneEntry(true)) as Document[];

                if (user.length) {
                    let value = '';
                    if (user[0]['account'] === 'user_1') {
                        value = USER_1_COOKIE;
                    }
                    if (user[0]['account'] === 'user_2') {
                        value = USER_2_COOKIE;
                    }
                    assign({ cookie: value, path: '/' + user[0]['username'], data: user[0] });
                } else {
                    return data;
                }

                return data;
            }

            const match = (await authenticateSignIn(req, res)) as any;

            if (!match.user) {
                return res.redirect('/login?m=not-exist');
            }
            if (!compareSync(req.body['password'], match.password)) {
                return res.redirect('/login?m=password-mismatch');
            }

            const cookies: {} = extractCookie(req.headers.cookie) as {};
            for (const cookie in cookies) {
                if (cookie.startsWith('evt')) {
                    res.clearCookie(cookie);
                }
            }

            res.cookie(match.cookie, match.value.toString(), { maxAge: 1000 * 60 * 60 * 24 * 31 });
            return res.redirect(match['path']);
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
