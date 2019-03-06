import AbstractRouter from '../abstracts/Router';
import { securePlatformFreelancers, uploader } from '../middlewares';

/**
 *  Handle all requests
 *
 * @class ViewRouter
 */
class DataRouter extends AbstractRouter {
    public constructor() {
        super();
        this.routeHandler();
        this.rejectHandler();
    }

    /**
     *  Listen for incoming requests
     *
     * @private
     * @memberof ViewRouter
     */
    protected routeHandler() {
        //  add routes here
        this.router.post('/route-here', (req, res) => {
            // implement route here
        });
    }

    /**
     *  Reject unhandled routes
     *
     * @private
     * @memberof ViewRouter
     */
    protected rejectHandler() {
        this.router.all('*', (req, res) => {
            res.status(500).json({ error: 'internal-server-error', message: `Unhandled ${req.method} route` });
        });
    }
}

module.exports = new DataRouter().route();
