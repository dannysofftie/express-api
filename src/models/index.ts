import { Application } from 'express';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { Account, IAccountDocument } from './Account';

export interface IDatabaseModels {
    Account: Model<IAccountDocument>;
}

export const models: IDatabaseModels = {
    Account,
};

export default async (app: Application, opts?: any) => {
    mongoose.connection.on('connected', () => console.log('Mongo connected successfully'));
    mongoose.connection.on('error', console.log);

    await mongoose.connect(app.configs.mongouri, { useNewUrlParser: true, keepAlive: true, useCreateIndex: true, useFindAndModify: true, useUnifiedTopology: true });

    app.decorate('models', models);
};
