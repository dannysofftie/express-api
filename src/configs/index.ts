import { config } from 'dotenv';
import { join } from 'path';
import { IEmailConfigs } from '../libraries/Email';
import { Application } from 'express';

export const uploadDirectories = {
    png: join(__dirname, '..', '..', 'uploads', 'images'),
    jpg: join(__dirname, '..', '..', 'uploads', 'images'),
    jpeg: join(__dirname, '..', '..', 'uploads', 'images'),
    gif: join(__dirname, '..', '..', 'uploads', 'gifs'),
    doc: join(__dirname, '..', '..', 'uploads', 'documents'),
    docx: join(__dirname, '..', '..', 'uploads', 'documents'),
    csv: join(__dirname, '..', '..', 'uploads', 'documents'),
    txt: join(__dirname, '..', '..', 'uploads', 'documents'),
    other: join(__dirname, '..', '..', 'uploads', 'other'),
};

config();

export interface IConfig {
    firebaseAccountJsonFile: string;
    apiurl: string;
    mongouri: string;
    apikey?: string;
    jwtsecret: string;
    mail: IEmailConfigs;
    appname: string;
    rootPath: string;
}

const production = process.env.NODE_ENV === `production`;

const gsuite = true;

const serviceKey = /** require('../../config/sample-service-3fe9c0354d05.json') */ {};

export const configs: IConfig = {
    apiurl: (() => {
        if (production) {
            return process.env.API_PROD_URL;
        }

        return process.env.API_LOCAL_URL;
    })(),
    mongouri: process.env.MONGO_PROD_URL,
    jwtsecret: process.env.JWT_SECRET_KEY,
    mail: {
        host: process.env.APP_EMAIL_HOST,
        port: process.env.APP_EMAIL_HOST.includes('gmail') || process.env.APP_EMAIL_HOST.includes('zoho') ? 465 : 25,
        auth: {
            user: process.env.APP_EMAIL_ADDRESS,
            ...(!gsuite && { pass: process.env.APP_EMAIL_PASSWORD }),
            ...(gsuite && {
                type: 'OAuth2',
                privateKey: serviceKey['private_key'],
                serviceClient: serviceKey['client_id'],
            }),
        },
    },
    appname: process.env.APPLICATION_NAME,
    rootPath: '/fht61s',
    firebaseAccountJsonFile: join(__dirname, '..', '..', 'config', 'isample-adminsdk-adgra-26b5699c31.json'),
};

export default (app: Application, opts: any, done: (err?: Error) => void) => {
    app.decorate('configs', configs);
};
