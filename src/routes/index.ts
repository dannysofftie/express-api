import { Router } from 'express';
import AbstractRouter from '../abstracts/Router';

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
        this.router.use('/', require('./view-routes'));
    }

    /**
     *  Reject unhandled routes
     *
     * @private
     * @memberof RouterInstance
     */
    protected rejectHandler() {
        this.router.all('*', (req, res) => {
            res.status(404).json({ error: `Unhandled ${req.method} endpoint` });
        });
    }
}

module.exports = new RouterInstance().route();
