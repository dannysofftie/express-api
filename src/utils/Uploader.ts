import { randomBytes } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import * as multer from 'multer';
import { uploadDirectories } from '../configs';
import { extname } from 'path';
import { configs } from '../configs';

export type MulterInstance = multer.Instance;

export type FilePathExtractor = (filename: string) => string;

/**
 * Create a random file name for every file into the file system.
 *  - It would be trivial for anyone to overwrite any file on the server by sending that name up.
 *    Also, it would cause problems if a user happens to upload a file with the same name as another file.
 *
 * @param {Express.Multer.File} file - binary data of the uploaded file
 * @returns
 */
const createRandomFileName = (file: Express.Multer.File) => {
    const name: string = randomBytes(18).toString('hex');

    const ext: string = file.originalname.split('.')[1];

    return name + '.' + ext;
};

/**
 * Returns an instance of local multer middleware, for uploading file to local file system
 * Storage.
 *
 *  - Returns file path as location in the directory.
 */
const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        Object.keys(uploadDirectories).forEach(dir => {
            !existsSync(uploadDirectories[dir]) && mkdirSync(uploadDirectories[dir], { recursive: true });
        });

        const rootPath = uploadDirectories[extname(file.originalname).split('.')[1]];

        // Check if current request is authorized
        // create directory for thet user if doesn't exist,
        // and return the new path. This will allow users to browse files within a directory
        // that only them have access to.

        cb(null, rootPath || uploadDirectories['other']);
    },
    filename: (req, file, cb) => {
        cb(null, createRandomFileName(file));
    },
});

export const extractFilePath = (filename: string) => {
    if (!filename) {
        return null;
    }

    const rootPath = uploadDirectories[extname(filename).split('.')[1]];

    const dir: string = rootPath || uploadDirectories['other'];

    return configs.apiurl + '/uploads' + dir.split('/uploads')[1] + '/' + filename;
};

/**
 * Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
 * It is written on top of [Busyboy]{@link https://github.com/mscdex/busboy} for maximum efficiency.
 *
 * @description
 * NOTE: Multer will not process any form which is not multipart (multipart/form-data).
 *
 * @export uploader
 *
 */
export const uploader: multer.Instance = multer({
    storage: localStorage,
});
