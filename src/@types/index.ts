import { Application } from 'express';
import { IConfig } from '../configs';
import { IDatabaseModels } from '../models';
import { IUtils } from '../utils';

type IRegister = (app: Application, opts?: any, done?: (err?: Error) => void) => void;

declare global {
    namespace Express {
        // tslint:disable-next-line:interface-name
        interface Application {
            models?: IDatabaseModels;
            configs?: IConfig;
            utils: IUtils;

            /**
             * Decorate this express instance with new properties. Throws an execption if you attempt to add the same decorator name twice
             *
             * @param {string} name
             * @param {*} decoration
             * @memberof Application
             */
            decorate(name: string, decoration: any): void;

            /**
             * Registers a plugin
             *
             * @param {IRegister} fn
             * @param {*} [opts]
             * @param {(err?: Error) => void} [done]
             * @memberof Application
             */
            register(fn: IRegister, opts?: any, done?: (err?: Error) => void): void;
        }
    }
}
