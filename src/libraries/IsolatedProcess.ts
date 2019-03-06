import * as childprocess from 'child_process';
import { existsSync } from 'fs';
import * as path from 'path';

/**
 * Initiates an external process, completely isolated from the main process.
 *
 * Will come in handy when executing CPU time intensive tasks.
 *
 * Example use cases:
 *  - Sending bulk email messages.
 *  - Sending bulk SMS messages.
 *  - Retrieving geographical information from coordinates. (Though might be slow at times, would require a thread rather than a process.)
 *
 * Processes initiated by this module will run in the background and will not block Node.js' event loop.
 *
 * @export
 * @param {string} file - file path of the file to launch isolated process on.
 * @param {(message: string) => void} callback
 */
export default function forkChildProcess(file: string, callback?: (message: string) => void) {
    !file && throwError();

    const filepath = path.resolve(file);

    // prevent process fork when the passed file does not match a file in the current file system
    !existsSync(filepath) && throwError();

    // @ts-ignore
    const child = childprocess.fork(filepath, [], { detached: true, stdio: 'ignore' });

    // isolate from parent's file descriptors
    child.unref();

    // errors that might occur in the child process will force it to shutdown gracefully without notifying this parent process
    // parent process will continue to run seemlessly.
    // to-do: implement a message passing channel that will attempt to resolve child process errors,
    // in most cases, resolved errors will refork another isolated process until the intended work is done.
    child.on('exit', () => {
        callback('Child process terminated');
    });
}

/**
 * Throw an error and terminate execution.
 *
 * Called when errors occur before isolated child processes are forked to prevent:
 *  - Disgraceful process shutdown.
 *  - Instances of orphan child processes.
 *
 */
function throwError() {
    throw new Error('Expected a file path to launch child process on, or file was not found!');
}
