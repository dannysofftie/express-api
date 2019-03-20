#!/usr/bin/env node

import * as awssdk from 'aws-sdk';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { createServer, Server } from 'http';
import * as mongoose from 'mongoose';
import { join } from 'path';
import * as serveFavicon from 'serve-favicon';
import { AMZN_ACCESS_KEY_ID, AMZN_SECRET_ACCESS_KEY, MONGO_LOCAL_URL, MONGO_PROD_URL, MONGO_DOCKER_URL, uploadDirectories } from '../configs';
import * as cors from 'cors';
import * as moment from 'moment';

require('moment-duration-format');

/**
 * Server class, configs and route handler
 *
 * @export
 * @class AppServer
 */
export default class App {
    /**
     * Instance of express application object
     *
     * @privates
     * @type {express.Application}
     * @memberof AppServer
     */
    private app: express.Application;

    /**
     * Instance of http server object
     *
     * @private
     * @type {Server}
     * @memberof AppServer
     */
    private server: Server;

    /**
     * Port number for application to listen to
     *
     * @private
     * @type {(number | string)}
     * @memberof AppServer
     */
    private port: number | string;

    /**
     * Static folder where static assets will be served, includes uploads directory.
     *
     * @private
     * @type {string[]}
     * @memberof PivotServer
     */
    private staticfolders: string[];

    constructor() {
        this.port = process.env.PORT || 5000;
        this.staticfolders = [join(__dirname, '..', '..', 'public'), join(__dirname, '..', '..', 'uploads')];
        this.app = express();
        this.server = createServer(this.app);
        this.configs();
        this.routes();
    }

    /**
     * Start server instance
     *
     * @memberof AppServer
     */
    public async start() {
        const port = this.normalizePort(this.port);
        this.server.listen(port, () => {
            console.log(`Server process: ${process.pid} listening on port: ${port}`);
        });
    }

    /**
     * Top level server configs
     *
     * @private
     * @memberof AppServer
     */
    private configs() {
        // add all static file folders asynchronoulsy
        [...this.staticfolders, ...Object.values(uploadDirectories)].forEach(dir => {
            this.app.use(express.static(join(dir)));
        });

        this.app.set('view engine', 'ejs');
        this.app.set('views', join(__dirname, '..', '..', 'views'));
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.use(cors({ origin: true, credentials: true, preflightContinue: true }));
        this.app.use(cookieParser());
        this.app.use(serveFavicon(join(__dirname, '..', '..', 'favicon.ico')));
        this.app.use((req, res, next) => {
            res.setHeader('X-Frame-Options', 'SAMEORIGIN');
            next();
        });

        this.app.use((req, res, next) => {
            try {
                const request = (req.headers['X-Requested-With'] || (req.headers['content-type'].includes('application/json') && 'XMLHttpRequest')) as string;
                // @ts-ignore
                req.ajax = request;
            } catch {
                //
            }
            next();
        });

        this.app.use((req, res, next) => {
            // @ts-ignore
            req.url = req.protocol + '://' + req.get('host') + req.originalUrl;
            return next();
        });

        // set up moment js for parsing dates and time
        this.app.locals.moment = moment;

        mongoose
            .connect(process.env.NODE_ENV === 'production' ? MONGO_PROD_URL : process.env.NODE_ENV === 'in-docker' ? MONGO_DOCKER_URL : MONGO_LOCAL_URL, {
                useNewUrlParser: true,
            })
            .then(() => {
                console.log('Mongo connected successfully');
            })
            .catch(e => console.log(e));

        // configure amazon aws globally
        // the sdk instance will be accessible anywhere within the app without instantiating again
        awssdk.config.update({ accessKeyId: AMZN_ACCESS_KEY_ID, secretAccessKey: AMZN_SECRET_ACCESS_KEY });
    }

    /**
     * Server router handler
     *
     * @privates
     * @memberof AppServer
     */
    private routes() {
        // handle all requests and forward to router
        this.app.use('/', require('../routes'));
    }

    /**
     * Normalize port to ensure a number is passed
     *
     * @private
     * @param {(string | number)} port
     * @returns
     * @memberof AppServer
     */
    private normalizePort(port: string | number): number {
        if (typeof port !== 'string' && typeof port !== 'number') {
            throw new TypeError(`Argument of type ${typeof port} cannot be used as port!`);
        }
        return Number(port);
    }
}
