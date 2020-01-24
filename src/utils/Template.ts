import * as ejs from 'ejs';
import { readFileSync } from 'fs';
import { minify } from 'html-minifier';
import { join } from 'path';

interface ITemplatePaths {
    template: 'account-creation' | 'reset-password';
}

const rootPath = join(__dirname, '..', '..', 'views', 'templates/');

const loadTemplate = {
    'account-creation': 'accounts/account-created.ejs',
    'reset-password': 'accounts/password-reset.ejs',
};

export type ICompileTemplate = (template: ITemplatePaths) => (data?: any) => string;

export const compileEjs = (template: ITemplatePaths) => {
    const text = readFileSync(rootPath + loadTemplate[template.template], 'utf-8');

    return (data?: any) => {
        const html = ejs.compile(text)(data);

        return minify(html, { collapseWhitespace: true });
    };
};
