import { AbstractRouter } from '../abstracts/Router';
import { Categories } from '../controllers/Categories';
import { Clientjobs } from '../controllers/Clientjobs';
import { Companies } from '../controllers/Companies';
import { Jobtypes } from '../controllers/Jobtypes';
import { Platformusers } from '../controllers/Platformusers';
import { Transactions } from '../controllers/Transactions';
import { Bids } from '../controllers/users/Bids';
import { Bookmarks } from '../controllers/users/Bookmarks';
import { Notifications } from '../controllers/users/Notifications';
import { Services } from '../controllers/users/Services';
import Braintree from '../libraries/Braintree';
import { allowAuthenticatedUser, securePlatformClients, securePlatformFreelancers, uploader } from '../middlewares';

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
        this.router.get('/freelancers-search', async (req, res) => {
            res.status(200).json(await new Platformusers(req, res).findFreelancersFromSearch().catch((e) => []));
        });
        this.router.get('/gigs-search', async (req, res) => {
            res.status(200).json(await new Services(req, res).findGigsForSearch().catch((e) => []));
        });
        this.router.get('/jobs-search', async (req, res) => {
            res.status(200).json(await new Clientjobs(req, res).findJobsForSearch().catch((e) => []));
        });

        this.router.post('/categories', uploader.any(), (req, res) => {
            new Categories(req, res).addNewEntry();
        });
        this.router.get('/categories', (req, res) => {
            new Categories(req, res).findAllEntries();
        });
        this.router.get('/categories/:slug', (req, res) => {
            new Categories(req, res).findOneEntry();
        });

        this.router.post('/jobtype/:categoryslug', uploader.any(), (req, res) => {
            new Jobtypes(req, res).addNewEntry();
        });
        this.router.get('/jobtypes', (req, res) => {
            new Jobtypes(req, res).findAllEntries();
        });
        this.router.get('/jobtype/:categoryslug', (req, res) => {
            new Jobtypes(req, res).findAllInCategory();
        });

        this.router.post('/company-profile', (req, res) => {
            new Companies(req, res).addNewEntry();
        });

        this.router.get('/freelancers', (req, res) => {
            new Platformusers(req, res).findAllEntries();
        });
        this.router.post('/update-profile', allowAuthenticatedUser, uploader.any(), (req, res) => {
            new Platformusers(req, res).findOneAndUpdate();
        });

        this.router.post('/create-gig', securePlatformFreelancers, uploader.any(), (req, res) => {
            new Services(req, res).addNewEntry();
        });
        this.router.post('/create-job', securePlatformClients, uploader.any(), (req, res) => {
            new Clientjobs(req, res).addNewEntry();
        });
        this.router.post('/notify-freelancer', uploader.any(), (req, res) => {
            new Notifications(req, res).addNewEntry();
        });
        this.router.get('/notifications', (req, res) => {
            new Notifications(req, res).findAllEntries();
        });
        this.router.post('/place-a-bid', (req, res) => {
            new Bids(req, res).addNewEntry();
        });
        this.router.post('/bookmark', (req, res) => {
            new Bookmarks(req, res).addNewEntry();
        });

        this.router.get('/braintree-access-token', async (req, res) => {
            const token = await new Braintree().generateToken().catch((e) => 'error');
            res.status(200).json({ token });
        });

        // receive payments for clients paying for freelancer gigs
        this.router.post('/checkouts', async (req, res) => {
            const result = await new Braintree({ amount: req.body['amount'], nonce: req.body['payment_method_nonce'] }).checkout();

            new Transactions(req, res).clientCheckout(result);
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
