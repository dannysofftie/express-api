import * as braintree from 'braintree';
import { BT_ENVIRONMENT, BT_MERCHANT_ID, BT_PUBLIC_KEY, BT_PRIVATE_KEY } from '../configs';

const environment = BT_ENVIRONMENT.charAt(0).toUpperCase() + BT_ENVIRONMENT.slice(1);

const TRANSACTION_SUCCESS_STATUSES = [
    braintree.Transaction.Status.Authorizing,
    braintree.Transaction.Status.Authorized,
    braintree.Transaction.Status.Settled,
    braintree.Transaction.Status.Settling,
    braintree.Transaction.Status.SettlementConfirmed,
    braintree.Transaction.Status.SettlementPending,
    braintree.Transaction.Status.SubmittedForSettlement,
];

const GATEWAY_NONCES = {
    Sandbox: 'fake-valid-nonce',
    Production: 'valid-nonce',
};

/**
 * Braintree checkout options, amount and nonce information.
 *
 * @description nonce - A payment method nonce is a secure, one-time-use reference to payment information.
 * It's the key element that allows your server to communicate sensitive payment information to Braintree without
 * ever touching the raw data.
 *
 * @interface IBraintreeOptions
 */
interface IBraintreeOptions {
    amount?: string | number;
    item?: string;
    nonce: string;
}

export default class Braintree {
    /**
     * Braintree gateway instance.
     *
     * @private
     * @type {braintree.BraintreeGateway}
     * @memberof Braintree
     */
    private gateway: braintree.BraintreeGateway;

    /**
     * Options passed for checkout purposes, expects amount and nonce data.
     *
     * @private
     * @type {IBraintreeOptions}
     * @memberof Braintree
     */
    private options: IBraintreeOptions;

    constructor(options?: IBraintreeOptions) {
        this.gateway = new braintree.BraintreeGateway({
            environment: braintree.Environment[environment],
            merchantId: BT_MERCHANT_ID,
            publicKey: BT_PUBLIC_KEY,
            privateKey: BT_PRIVATE_KEY,
        });

        this.options = {
            amount: (options && options.amount) || 0,
            nonce: (options && options.nonce) || GATEWAY_NONCES[environment],
        };
    }

    /**
     * Generate access token to be used when performing drop-in UI checkouts.
     *
     * @returns {Promise<string>}
     * @memberof Braintree
     */
    public async generateToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.gateway.clientToken.generate({}, (err: any, response: any) => {
                if (err) {
                    return reject(err);
                }
                return resolve(response.clientToken);
            });
        });
    }

    /**
     * Find and verify a transaction with Braintree gateway.
     *
     * @param {string} id - transaction id of previously done transaction.
     * @memberof Braintree
     */
    public async verify(id: string) {
        const transaction = (await new Promise((resolve, reject) => {
            this.gateway.transaction.find(id, (err: any, response: any) => {
                err && reject(err);
                resolve(response);
            });
        })) as any;

        if (TRANSACTION_SUCCESS_STATUSES.indexOf(transaction.status) !== -1) {
            return { message: 'success' };
        }
        return { message: 'failed', stack: transaction.status };
    }

    /**
     * Perform Braintree checkouts. For both PayPal and credit card accounts.
     *
     * @returns
     * @memberof Braintree
     */
    public async checkout() {
        const result = await this.gateway.transaction
            .sale({
                amount: this.options.amount,
                paymentMethodNonce: this.options.nonce,
                options: {
                    submitForSettlement: true,
                },
            })
            .catch((err) => 'Error ' + err);

        if (result.toString().includes('Error')) {
            return result.message;
        }

        return result.transaction;
    }
}
