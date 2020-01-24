import { Application } from 'express';
import { Csvparser, parseCsv } from './Csvparser';
import resolveLocals, { ResolveLocals } from './Resolvelocals';
import { compileEjs, ICompileTemplate } from './Template';
import { IJWTToken, JWTToken } from './Token';
import { extractFilePath, FilePathExtractor, MulterInstance, uploader } from './Uploader';

export interface IUtils {
    token: IJWTToken;
    compileEjs: ICompileTemplate;
    parseCsv: Csvparser;
    uploader: MulterInstance;
    extractFilePath: FilePathExtractor;
    resolveLocals: ResolveLocals;
}

const utils: IUtils = {
    token: JWTToken,
    compileEjs,
    parseCsv,
    uploader,
    extractFilePath,
    resolveLocals,
};

export default (app: Application, opts: any) => {
    app.decorate('utils', utils);
};
