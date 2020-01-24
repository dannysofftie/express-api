import { Application, NextFunction, Request, Response } from 'express';
import { Document } from 'mongoose';
import resolveLocals from '../utils/Resolvelocals';

/**
 * View route type-checking interface,
 * Each definition to have
 *  - route,
 *  - view,
 *  - type,
 *  - middleware,
 *  - locals
 *
 * @interface IViewRoutes
 */
interface IViewRoutes {
    route: string;
    view: string;
    middleware: (req: Request, res: Response, next: NextFunction) => any;
    locals: Array<(req: Request, res?: Response) => Promise<Document[] | Response | any>>;
}

/**
 * All view routes defined as a single instance to reduce redundancy when declaring in express router
 *
 * Recognized path definition entries:
 *  - `route` path to listen for from the browser,
 *  - `view` the view path to render as defined in views folder,
 *  - `type` not usable for now but will come in handy when the application grows,
 *  - `middleware` method to execute before terminating a request,
 *  - `locals` method to execute. Should always return accessible variables from within ejs templating engine
 */
export const routes: IViewRoutes[] = [
    { route: '/', view: 'index', middleware: null, locals: [] },
    { route: '*', view: '404', middleware: null, locals: [] },
];

export default (app: Application, opts: any, done: (err?: Error) => void) => {
    app.get('/here', (req, res) => {
        console.log('Get route /here');

        res.json({ message: 'Received' });
    });

    // add all view routes to express route table
    for (const route of routes) {
        if (route.middleware) {
            app.get(route.route, route.middleware, async (req, res) => {
                res.render(route.view, await app.utils.resolveLocals(route.locals, req, res));
            });
        } else {
            app.get(route.route, async (req, res) => {
                res.render(route.view, await app.utils.resolveLocals(route.locals, req, res));
            });
        }
    }

    // implement pass over to the next middleware
};
