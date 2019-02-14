import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { PathParams } from 'express-serve-static-core';
import { Document } from 'mongoose';

/**
 * Data routes type-checking interface,
 * Each definition to have,
 *  - path,
 *  - middleware and
 *  - method to execute
 *
 * @interface IDataRoutes
 */
interface IDataRoutes {
    type: (path: PathParams, ...handlers: RequestHandler[]) => Router;
    path: string;
    middleware: Array<() => any>;
    class: any;
    method: (req: Request, res: Response) => Promise<Document[] | Response>;
}

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
    type: string;
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
export const viewRoutes: IViewRoutes[] = [
    /**
     * Define admin views and related data
     *
     */
    {
        route: '/',
        view: '',
        type: '',
        middleware: null,
        locals: [],
    },
    // PRODUCTION 404 ERROR HANDLER
    process.env.NODE_ENV === 'production' && {
        route: '*',
        view: 'general/404-page',
        type: '',
        middleware: null,
        locals: [],
    },
];
