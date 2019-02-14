import { Request, Response } from 'express';
import { Document } from 'mongoose';
import { Controller } from '../abstracts/Controller';

/**
 * Create, update, delete and retrieve Activities by freelancers.
 *
 * @export
 * @class Activities
 * @extends {Controller}
 */
export class Activities extends Controller {
    constructor(request: Request, response: Response) {
        super(request, response);
    }

    /**
     * Interface to update existing Activities previously created by freelancers
     *
     * @returns {Promise<Response>}
     * @memberof Activities
     */
    public async findOneAndUpdate(): Promise<Response> {
        throw new Error('Method not implemented.');
    }

    /**
     * Find and retrieve all Activities available.
     *
     * These are the Activities previously created by freelancers.
     *
     * @returns {Promise<Response>}
     * @memberof Activities
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
     * @memberof Activities
     */
    public async addNewEntry(): Promise<Response> {
        throw new Error('Method not implemented.');
    }

    /**
     * Find matching bid, probably from search
     *
     * @returns {Promise<Response>}
     * @memberof Activities
     */
    public async findOneEntry(internal?: boolean): Promise<Response | Document[]> {
        throw new Error('Method not implemented.');
    }
}
