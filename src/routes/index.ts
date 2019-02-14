import { join } from 'path';
import { Router, Request, Response } from 'express';
import { AbstractRouter } from '../abstracts/Router';
import * as swagger from 'swagger-ui-express';

/**
 *  Handle all requests
 *
 * @class RouterInstance
 */
class RouterInstance extends AbstractRouter {
    /**
     * Creates an instance of RouterInstance.
     *
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
    protected routeHandler() {
        this.router.use('/data', require('./data-routes'));
        this.router.use('/auth', require('./auth-routes'));
        // handle any other as view route
        this.router.use('/docs', swagger.serve, swagger.setup(require(join(__dirname, '..', '..', 'swagger.json'))));
        this.router.use('/', require('./view-routes'));
    }

    /**
     *  Reject unhandled routes
     *
     * @private
     * @memberof RouterInstance
     */
    protected rejectHandler() {
        this.router.get('*', (req: Request, res: Response) => {
            // res.status(404).render('.... 404 page .....')
        });

        this.router.post('*', (req: Request, res: Response) => {
            res.status(404).json({ error: 'unhandled post route' });
        });
    }
}

module.exports = new RouterInstance().route();
