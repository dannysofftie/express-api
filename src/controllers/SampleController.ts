import { Request, Response } from 'express';
import { Document } from 'mongoose';
import Controller from '../abstracts/Controller';

/**
 * Create, update, delete and retrieve SampleController by freelancers.
 *
 * @export
 * @class SampleController
 * @extends {Controller}
 */
export default class SampleController extends Controller {
    constructor(request: Request, response: Response) {
        super(request, response);
    }

    /**
     * Interface to update existing SampleController previously created by freelancers
     *
     * @returns {Promise<Response>}
     * @memberof SampleController
     */
    public async findOneAndUpdate(): Promise<Response> {
        throw new Error('Method not implemented.');
    }

    /**
     * Find and retrieve all SampleController available.
     *
     * These are the SampleController previously created by freelancers.
     *
     * @returns {Promise<Response>}
     * @memberof SampleController
     */
    public async findAllEntries(): Promise<Response> {
        throw new Error('Method not implemented.');
    }

    /**
     * Add a new bid. Require freelancers to be registered and accounts verified.
     *
     * This is a protected resource.
     *
     * @returns {Promise<Response>}
     * @memberof SampleController
     */
    public async addNewEntry(): Promise<Response> {
        throw new Error('Method not implemented.');
    }

    /**
     * Find matching bid, probably from search
     *
     * @returns {Promise<Response>}
     * @memberof SampleController
     */
    public async findOneEntry(internal?: boolean): Promise<Response | Document[]> {
        throw new Error('Method not implemented.');
    }
}
