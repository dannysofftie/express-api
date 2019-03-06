import { Request, Response } from 'express';
import { Document, Types } from 'mongoose';
import { extractCookie } from '../middlewares';

/**
 * Retrieve details of the current user logged in.
 *
 * @param {string} value
 * @returns
 */
const lu = (req: Request, value: string) => {
    return extractCookie(req.headers.cookie, value) as string;
};

/**
 * Abstract implementation of controller classes,
 *
 * Classes that implement this Controller class must implement methods defined,
 * each child controller must implement a getter, setter and a delete middleware
 *
 * @export
 * @class Controller
 */
export default abstract class Controller {
    /**
     * Request object for incoming requests to controller classes
     *
     * @protected
     * @type {Request}
     * @memberof Controller
     */
    protected request: Request;

    /**
     * Response object for outgoing requests from controller classes
     *
     * @protected
     * @type {Response}
     * @memberof Controller
     */
    protected response: Response;

    /**
     * Body instance of the incoming request body
     *
     * @protected
     * @type {*}
     * @memberof Controller
     */
    protected body: object;

    /**
     * Details of the current logged in user.
     *
     * @protected
     * @type {{ id: Types.ObjectId; username: string }}
     * @memberof Controller
     */
    protected loggedin: { id: Types.ObjectId; username?: string };

    /**
     * Creates an instance of Controller.
     * @param {Request} request
     * @param {Response} response
     * @memberof Controller
     */
    public constructor(request?: Request, response?: Response) {
        this.request = request;
        this.response = response;
        this.body = this.request.body;
    }

    /**
     * Finds and updates a document that matches a defined search criteria from the model referenced by the controller class
     *
     * @protected
     * @abstract
     * @returns {Promise<string[]>}
     * @memberof Controller
     */
    public abstract async findOneAndUpdate(): Promise<Response>;

    /**
     * Finds and returns data from the model referenced by the controller class
     *
     * @protected
     * @abstract
     * @returns {Promise<string[]>}
     * @memberof Controller
     */
    public abstract async findAllEntries(): Promise<Response | Document[]>;

    /**
     * Creates a new data entry instance to the model referenced by the controller class
     *
     * @protected
     * @abstract
     * @memberof Controller
     */
    public abstract async addNewEntry(): Promise<Response>;

    /**
     * Finds and returns data matching a defined search criteria from the model referenced by the controller class
     *
     * @protected
     * @abstract
     * @returns {Promise<string[]>}
     * @memberof Controller
     */
    public abstract async findOneEntry(): Promise<Response | Document[]>;
}
