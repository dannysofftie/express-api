import * as ejs from 'ejs';
import * as path from 'path';
import { readFileSync } from 'fs';

interface Template {
    template: 'product' | 'confirmation' | 'promotion' | 'marketing';
}

const loadTemplate = {
    product: path.join(__dirname, '..', '..', 'views/templates/new-product.ejs'),
    confirmation: path.join(__dirname, '..', '..', 'views/templates/confirmation.ejs'),
    promotion: path.join(__dirname, '..', '..', 'views/templates/promotion.ejs'),
    marketing: path.join(__dirname, '..', '..', 'views/templates/marketing.ejs'),
};

/**
 * Provides a utility to compile html emails, with custom data.
 *
 * The compile method returns html text from precompiled ejs template
 *
 * @export
 * @class Emailcreator
 */
export default class Compiletemplate {
    /**
     * Template to load from email templates
     * e.g, promotion, product, verification
     * @private
     * @type {string}
     * @memberof Emailcreator
     */
    private template: string;

    /**
     * Path to email template
     *
     * @private
     * @type {string}
     * @memberof Emailcreator
     */
    private templatepath: string;

    public constructor(options: Template) {
        this.template = options.template;
        this.templatepath = loadTemplate[this.template];
    }

    /**
     * Compile ejs to html and return string
     *
     * @param {object} data
     * @returns {Promise<string>}
     * @memberof Emailcreator
     */
    public async compile(data: object): Promise<string> {
        return await ejs.compile(readFileSync(this.templatepath, 'utf-8'))(data);
    }
}
