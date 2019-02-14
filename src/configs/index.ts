import { join } from 'path';

require('dotenv').config();

export const uploadDirectories = {
    png: join(__dirname, '..', '..', 'uploads', 'images'),
    jpg: join(__dirname, '..', '..', 'uploads', 'images'),
    jpeg: join(__dirname, '..', '..', 'uploads', 'images'),
    gif: join(__dirname, '..', '..', 'uploads', 'gifs'),
    doc: join(__dirname, '..', '..', 'uploads', 'documents'),
    docx: join(__dirname, '..', '..', 'uploads', 'documents'),
};

export const MONGO_LOCAL_URL = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DATABASE}`;

export const MONGO_PROD_URL = 'mongodb+srv://pivot-team:pivot-1234@pivot-cluster-bhspm.gcp.mongodb.net/pivot-db?ssl=true&retryWrites=true';

export const SMS_USERNAME = process.env.SMS_USERNAME;

export const SMS_API_KEY = process.env.SMS_API_KEY;

export const APP_EMAIL_ADDRESS = process.env.APP_EMAIL_ADDRESS;

export const APP_EMAIL_PASSWORD = process.env.APP_EMAIL_PASSWORD;

export const APP_EMAIL_HOST = process.env.APP_EMAIL_HOST;

export const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;

export const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

export const RESOLVED_APP_URL = process.env.NODE_ENV === 'production' ? process.env.APP_PROD_URL : process.env.APP_LOCAL_URL;

export const AMZN_ACCESS_KEY_ID = process.env.AMZN_ACCESS_KEY_ID;

export const AMZN_SECRET_ACCESS_KEY = process.env.AMZN_SECRET_ACCESS_KEY;

export const BT_ENVIRONMENT = process.env.BT_ENVIRONMENT;

export const BT_MERCHANT_ID = process.env.BT_MERCHANT_ID;

export const BT_PUBLIC_KEY = process.env.BT_PUBLIC_KEY;

export const BT_PRIVATE_KEY = process.env.BT_PRIVATE_KEY;

export const MONGO_DOCKER_URL = 'mongodb://mongo:27017/pivotdb';
