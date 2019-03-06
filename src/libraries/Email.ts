import { Transporter, createTransport } from 'nodemailer';
import { ReadStream } from 'fs';
import { APP_EMAIL_HOST, APP_EMAIL_ADDRESS, APP_EMAIL_PASSWORD } from '../configs';

/**
 * Email sending and retrival handler
 *
 * @export
 * @class Email
 */
export default class Email {
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
     * Attachments to attach to email message.
     *
     * @private
     * @type {Array<{
     *         filename: string;
     *         content: ReadStream;
     *     }>}
     * @memberof Email
     */
    private attachments: Array<{
        filename: string;
        content: ReadStream;
    }>;

    /**
     * Creates a new instance to deliver email(s) to specified email address(es)
     * @param {string[]} recipients receiver email address(es) to send email to
     * @param {(string | Buffer)} message message to deliver in html format
     * @param {string} subject subject of the email to send e.g `Your request has been processed`
     * @param {string} fromtext name to embed in `from` field e.g `Holiday invitation`
     * @param {string} tocustomname name to embed in `to` field e.g `Valued client`
     * @memberof Email
     */
    public constructor(
        recipients: string[],
        message: string | Buffer,
        subject: string,
        fromtext: string,
        tocustomname: string,
        attachments?: Array<{
            filename: string;
            content: ReadStream;
        }>,
    ) {
        this.recipients = recipients;
        this.message = message;
        this.subject = subject;
        this.fromtext = fromtext;
        this.tocustomname = tocustomname;
        attachments && (this.attachments = attachments);
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
        this.recipients.forEach(async (recipient) => {
            const response = await this.transport.sendMail({
                html: this.message,
                to: `${this.tocustomname} <${recipient}>`,
                from: `${this.fromtext} <${APP_EMAIL_ADDRESS}>`,
                subject: this.subject,
                replyTo: APP_EMAIL_ADDRESS,
                attachments: this.attachments,
            });
            mailstatus.push(response);
        });
        return mailstatus;
    }

    /**
     * Construct transport to send emails
     *
     * @returns {Promise<void>}
     * @memberof Email
     */
    private async constructTransport(): Promise<void> {
        this.transport = createTransport({
            pool: true,
            host: APP_EMAIL_HOST,
            port: APP_EMAIL_HOST.includes('gmail') ? 465 : 25,
            secure: false,
            auth: {
                user: APP_EMAIL_ADDRESS,
                pass: APP_EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    }
}
