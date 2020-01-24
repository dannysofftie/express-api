import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { createServer, Server } from 'http';
import * as moment from 'moment';
import { join } from 'path';
import * as serveFavicon from 'serve-favicon';
import configs from '../configs';
import models from '../models';
import utils from '../utils';
import views from '../routes/views';

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

    constructor() {
        this.port = process.env.PORT || 5000;
        this.app = express();
        this.server = createServer(this.app);
        this.configs();
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
        this.app['register'] = (fn: (app: express.Application, opts?: any, done?: (err?: Error) => void) => void, opts?: any) => {
            const originalMethod = fn;

            if (typeof fn !== 'function') {
                throw new TypeError('fn is not a function');
            }

            // validate that this plugin has not been registered before

            // execute register plugin
            fn(this.app, opts);
        };

        this.app['decorate'] = (name: string, decoration: any) => {
            if (this.app[name]) {
                throw new Error(`A decorator with a similar name ${name} has already been registered!`);
            }

            this.app[name] = decoration;
        };

        this.app.use(express.static(join(__dirname, '..', '..', 'uploads')));
        this.app.use(express.static(join(__dirname, '..', '..', 'public')));

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

        // set up moment js for parsing dates and time
        this.app.locals.moment = moment;

        this.app.register(configs);

        this.app.register(utils);

        this.app.register(models);

        this.app.register(views);
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
