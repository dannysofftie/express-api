import { Schema, model, Document } from 'mongoose';

export type TAccount = 'admin' | 'regular';

export interface IAccount {
    account: TAccount;
    name: string;
    email: string;
}

export interface IAccountDocument extends IAccount, Document {}

const account = new Schema<IAccountDocument>(
    {
        account: {
            type: String,
            required: true,
        },
        name: {
            type: String,
        },
        email: {
            type: String,
        },
    },
    { timestamps: { createdAt: 'createdat', updatedAt: 'updatedat' } }
);

export const Account = model<IAccountDocument>('accounts', account);
