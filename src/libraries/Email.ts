import { Transporter, createTransport } from 'nodemailer';
import { APP_EMAIL_HOST, APP_EMAIL_ADDRESS, APP_EMAIL_PASSWORD } from '../configs';

interface Options {
    recipients: string[];
    message: string | Buffer;
    subject: string;
    fromtext: string;
    tocustomname: string;
}

/**
 * Email sending and retrival handler
 *
 * @export
 * @class Email
 */
export class Email {
    /**
     * Custom name to embedd in 'to field'
     *
     * @private
     * @type {string}
     * @memberof Email
     */
    private tocustomname: string;

    /**
     * Recipients to deliver email to
     *
     * @private
     * @type {string[]}
     * @memberof Email
     */
    private recipients: string[];

    /**
     * Message to deliver to specified emails
     *
     * @private
     * @type {string}
     * @memberof Email
     */
    private message: string | Buffer;

    /**
     * Email subject
     *
     * @private
     * @type {string}
     * @memberof Email
     */
    private subject: string;

    /**
     * Nodemailer transport instance
     *
     * @private
     * @type {Transporter}
     * @memberof Email
     */
    private transport: Transporter;

    /**
     * Text to add in 'from' field before sender email address
     *
     * @private
     * @type {string}
     * @memberof Email
     */
    private fromtext: string;

    /**
     * Creates a new instance to deliver email(s) to specified email address(es)
     * @param {string[]} recipients receiver email address(es) to send email to
     * @param {(string | Buffer)} message message to deliver in html format
     * @param {string} subject subject of the email to send e.g `Your request has been processed`
     * @param {string} fromtext name to embed in `from` field e.g `Holiday invitation`
     * @param {string} tocustomname name to embed in `to` field e.g `Valued client`
     * @memberof Email
     */
    public constructor(options: Options) {
        this.recipients = options.recipients;
        this.message = options.message;
        this.subject = options.subject;
        this.fromtext = options.fromtext;
        this.tocustomname = options.tocustomname;
    }

    /**
     * Construct transport to send emails
     *
     * @returns {Promise<void>}
     * @memberof Email
     */
    public async constructTransport(): Promise<void> {
        this.transport = createTransport({
            pool: true,
            host: APP_EMAIL_HOST,
            port: APP_EMAIL_HOST.includes('gmail') ? 465 : 25,
            secure: APP_EMAIL_HOST.includes('gmail') ? true : false,
            auth: {
                user: APP_EMAIL_ADDRESS,
                pass: APP_EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    }

    /**
     * Execute send to send email to passed email addresses
     *
     * @returns {Promise<string[]>}
     * @memberof Email
     */
    public async send(): Promise<string[]> {
        await this.constructTransport();
        const mailstatus: string[] = [];
        for await (const mail of this.recipients) {
            const response = await this.transport.sendMail({
                html: this.message,
                to: `${this.tocustomname} <${mail}>`,
                from: `${this.fromtext} <${APP_EMAIL_ADDRESS}>`,
                subject: this.subject,
                replyTo: APP_EMAIL_ADDRESS,
            });
            mailstatus.push(response);
        }
        return mailstatus;
    }
}
