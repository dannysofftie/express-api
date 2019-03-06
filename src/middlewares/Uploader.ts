import * as awssdk from 'aws-sdk';
import { randomBytes } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import * as multer from 'multer';
import * as multers3 from 'multer-s3';
import { uploadDirectories } from '../configs';

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
 * Returns an instance of Amazon S3 multer middleware, for uploading file to Amazon S3
 * Storage.
 *
 *  - Returns file path as url
 */
const awsSimpleStorage = multers3({
    s3: new awssdk.S3(),
    bucket: 'amazon-s3-bucket-name',
    acl: 'public-read',
    metadata(req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key(req, file, cb) {
        cb(null, createRandomFileName(file));
    },
});

/**
 * Returns an instance of local multer middleware, for uploading file to local file system
 * Storage.
 *
 *  - Returns file path as location in the directory.
 */
const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        Object.keys(uploadDirectories).forEach((dir) => {
            !existsSync(uploadDirectories[dir]) && mkdirSync(uploadDirectories[dir], { recursive: true });
        });
        cb(null, uploadDirectories[file.originalname.split('.')[1]] || uploadDirectories['uncategorized']);
    },
    filename: (req, file, cb) => {
        cb(null, createRandomFileName(file));
    },
});

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
    storage: process.env.NODE_ENV === 'production' ? awsSimpleStorage : localStorage,
});
