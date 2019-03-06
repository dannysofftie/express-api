import { Router } from 'express';

/**
 *  Handle all requests
 *
 * @class AbstractRouter
 */
export default abstract class AbstractRouter {
    /**
     *  Instance of express router object
     *
     * @protected
     * @type {Router}
     * @memberof AbstractRouter
     */
    protected router: Router;

    /**
     * Creates an instance of AbstractRouter.
     * @memberof AbstractRouter
     */
    constructor() {
        this.router = Router({ caseSensitive: true, strict: true });
    }

    /**
     * Returns instance of express router to expose to module exports
     *
     * @returns {Router}
     * @memberof AbstractRouter
     */
    public route(): Router {
        return this.router;
    }

    /**
     *  Listen for incoming requests
     *
     * @protected
     * @memberof AbstractRouter
     */
    protected abstract routeHandler(): void;

    /**
     *  Reject unhandled routes
     *
     * @protected
     * @memberof AbstractRouter
     */
    protected abstract rejectHandler(): void;
}
