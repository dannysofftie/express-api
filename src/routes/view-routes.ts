import { Router } from 'express';
import AbstractRouter from '../abstracts/Router';
import { viewRoutes } from '../configs/routes';
import { extractCookie } from '../middlewares/Cookies';
import ResolveLocals from '../utilities/ResolveLocals';

/**
 *  Handle all requests
 *
 * @class RouterInstance
 */
class ViewInstance extends AbstractRouter {
    /**
     * Creates an instance of RouterInstance.
     * @memberof RouterInstance
     */
    public constructor() {
        super();
        this.router = Router({ caseSensitive: true, strict: true });
        this.routeHandler();
        this.rejectHandler();
    }

    /**
     *  Listen for incoming requests
     *
     * @private
     * @memberof RouterInstance
     */
    protected async routeHandler() {
        this.router.get('/logout', (req, res) => {
            const cookies: string[] = Object.keys(extractCookie(req.headers.cookie));

            cookies.forEach((cookie) => {
                if (cookie.includes('evt-')) {
                    res.clearCookie(cookie);
                }
            });

            res.redirect(req.query['redirect'] ? req.query['redirect'] : '/?logged-out');
        });

        // add all view routes to express route table
        viewRoutes.forEach((route) => {
            if (route.middleware && route.locals) {
                this.router.get(route.route, route.middleware, async (req, res) => {
                    res.render(route.view, { ...(await ResolveLocals(route.locals, req, res)) });
                });
            } else if (route.middleware && !route.locals) {
                this.router.get(route.route, route.middleware, async (req, res) => {
                    res.render(route.view, { ...(await ResolveLocals(route.locals, req, res)) });
                });
            } else {
                this.router.get(route.route, async (req, res) => {
                    res.render(route.view, { ...(await ResolveLocals(route.locals, req, res)) });
                });
            }
        });
    }

    /**
     *  Reject unhandled routes
     *
     * @private
     * @memberof RouterInstance
     */
    protected rejectHandler() {
        this.router.all('*', (req, res) => {
            console.log(req.url);
            res.status(404).json({ error: `Unhandled ${req.method} endpoint` });
        });
    }
}

module.exports = new ViewInstance().route();
