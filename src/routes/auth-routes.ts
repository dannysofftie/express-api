import { Administrators } from './../controllers/Administrators';
import { Companies } from './../controllers/Companies';
import { AbstractRouter } from '../abstracts/Router';
import * as passport from 'passport';
import { Platformusers } from '../controllers/Platformusers';
import { Request, Response } from 'express';
import { Document } from 'mongoose';
import { compareSync } from 'bcrypt';
import { extractCookie } from '../middlewares/Cookies';

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
        this.router.get('/company-profile/verify/:email/:code', (req, res) => {
            new Companies(req, res).verifyCompanyAccount();
        });
        this.router.post('/signup', (req, res) => {
            new Platformusers(req, res).addNewEntry();
        });
        this.router.post('/new-admin', (req, res) => {
            new Administrators(req, res).addNewEntry();
        });

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

                const user: Document[] = (await new Platformusers(req, res).findOneEntry(true)) as Document[];
                if (user.length) {
                    // prompt user to confirm their accounts if unverified
                    if (!user[0]['vstatus']) {
                        return { error: 'unverified-account', user: user[0] };
                    }
                    // prompt user to set up their accounts if signin-ing in for the first time
                    if (!user[0]['account']) {
                        return { error: 'select-account-type', user: user[0] };
                    }
                    if (user[0]['account'] === 'freelancer') {
                        assign({ cookie: 'pvt-fr-ssid', path: '/' + user[0]['username'] + '/dashboard', data: user[0] });
                    } else {
                        assign({ cookie: 'pvt-cl-ssid', path: '/' + user[0]['username'] + '/account', data: user[0] });
                    }
                }

                const admin: Document[] = (await new Administrators(req, res).findOneEntry(true)) as Document[];
                if (admin.length) {
                    assign({ cookie: 'pvt-adm-ssid', path: '/admin', data: admin[0] });
                }

                return data;
            }

            const match = (await authenticateSignIn(req, res)) as any;

            if (match.error) {
                if (match.error === 'unverified-account') {
                    return res.json({
                        error: `Account not verified! Check your email for a verification link.`,
                        username: match.user.username,
                    });
                }
                if (match.error === 'select-account-type') {
                    if (!compareSync(req.body['password'], match.user.password)) {
                        return res.json({ message: 'Password mismatch!' });
                    }
                    res.cookie('pvt-profile', match.user._id.toString(), { maxAge: 1000 * 60 * 60 * 24 });
                    return res.json({
                        message: `Success! Complete account setup!`,
                        path: `/${match.user['username']}/account-setup`,
                    });
                }
            }

            if (!match.user) {
                return res.json({
                    error: 'Username or email does not exist!',
                });
            }
            if (!compareSync(req.body['password'], match.password)) {
                return res.json({
                    error: 'Password mismatch!',
                });
            }

            // terminate all other existing pivot authentication instances before allowing incoming login request into the system
            // prevent access to data that would otherwise leak to unauthorized authentication instances
            const cookies: {} = extractCookie(req.headers.cookie) as {};
            for (const cookie in cookies) {
                if (cookie.startsWith('pvt')) {
                    res.clearCookie(cookie);
                }
            }

            res.cookie(match.cookie, match.value.toString(), { maxAge: 1000 * 60 * 60 * 24 });

            return res.json({ message: 'Authenticated! Redirecting in a few.', username: match.username, path: req.query['redirect'] ? req.query['redirect'] : match.path });
        });

        this.router.get('/verify/:email/:code', (req, res) => {
            new Platformusers(req, res).verifyUserAccount();
        });

        this.router.post('/resend-mail/:email', (req, res) => {
            new Platformusers(req, res).resendVerificationEmail();
        });

        this.router.get('/login/twitter', passport.authenticate('twitter'));
        this.router.get('/login/twitter/return', passport.authenticate('twitter', { failureRedirect: '/auth/login' }), (req, res) => {
            // redirect to main site and set cookies
        });
        this.router.get('/login/facebook', passport.authenticate('facebook'));
        this.router.get('/login/facebook/return', passport.authenticate('facebook', { failureRedirect: '/auth/login' }), (req, res) => {
            // redirect to main site and set cookies
        });
        this.router.get('/login/google', passport.authenticate('google'));
        this.router.get('/login/google/return', passport.authenticate('google', { failureRedirect: '/auth/login' }), (req, res) => {
            // redirect to main site and set cookies
        });
        this.router.get('/login/instagram', passport.authenticate('instagram'));
        this.router.get('/login/instagram/return', passport.authenticate('instagram', { failureRedirect: '/auth/login' }), (req, res) => {
            // redirect to main site and set cookies
        });
    }

    /**
     * Unhandled route requests to authentication will be rejected automatically
     *
     * @protected
     * @memberof AuthRoutes
     */
    protected rejectHandler(): void {
        this.router.post('*', (req, res) => {
            res.status(500).json({ error: 'unhandled-post-route' });
        });
        this.router.get('*', (req, res) => {
            res.status(500).json({ error: 'unhandled-get-route' });
        });
    }
}

module.exports = new AuthRoutes().route();
