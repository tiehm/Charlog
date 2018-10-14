import * as fs       from 'fs';
import * as path     from 'path';
import * as readline from 'readline';
import * as moment   from 'moment';
import chalk         from 'chalk';
import * as pad      from 'pad';

import WriteStream = NodeJS.WriteStream;

interface Options {
    tag?: string,
    interactive?: boolean,
    uppercaseTag?: boolean,
    date?: boolean,
    timestamp?: boolean,
    filename?: boolean,
    setTagLength?: number,
    setFileLength?: number,
    loggers?: {
        [name: string]: {
            tag: string,
            color: string
        }
    }
}
interface ICharlog {
    readonly interactive: boolean;
    readonly uppercaseTag: boolean;
    before: boolean;
    readonly tag: string;
    readonly date: boolean;
    readonly timestamp: boolean;
    readonly filename: boolean;
    readonly longestFileName: number;
    readonly longestTagName: number;
    readonly stream: WriteStream

    loggers: {
        [name: string]: {
            tag: string,
            color: string
        }
    }

}

export class Charlog implements ICharlog {

    [x: string]: any;

    /**
     * @typedef Options
     * @private
     * @property {string} [tag] The console Tag when logging
     * @property {boolean} [interactive] Set the interactive setting, deletes last log on true
     * @property {boolean} [uppercaseTag] Set the tag to uppercase all the time
     * @property {boolean} [date] Set if the current date should be shown
     * @property {boolean} [timestamp] Set if current time should be shown
     * @property {boolean} [filename] Set if filename should be shown
     * @property {number} [setTagLength] Set the max length of a tag
     * @property {number} [setFileLength] Set the max length of a file
     * @property [loggers] Custom loggers
     */

    readonly interactive: boolean = false;
    readonly uppercaseTag: boolean = true;
    before: boolean = false;
    readonly tag: string = 'MAIN';
    readonly date: boolean = false;
    readonly timestamp: boolean = true;
    readonly filename: boolean = true;
    loggers: {
        [name: string]: {
            tag: string,
            color: string
        }
    } = {
        error: {
            tag: 'error',
            color: 'red'
        },
        debug: {
            tag: 'debug',
            color: 'magenta'
        },
        success: {
            tag: 'success',
            color: 'green'
        },
        warn: {
            tag: 'warn',
            color: 'yellow'
        }
    };
    readonly longestFileName: number = 0;
    readonly longestTagName: number= 0;
    readonly stream = process.stdout;

    /**
     *
     * @param {Options} options
     */
    constructor (options: Options = {}) {

        let pkgConfig = JSON.parse(fs.readFileSync(process.cwd() + '/package.json', {encoding: 'utf-8'}));
        let usePkg = !!pkgConfig.charlog;
        if (usePkg) {
            pkgConfig = pkgConfig.charlog;
            this.tag = typeof pkgConfig.tag === 'undefined' ? 'MAIN' : pkgConfig.tag;
            this.interactive = typeof pkgConfig.interactive === 'undefined' ? false : pkgConfig.interactive;
            this.uppercaseTag = typeof pkgConfig.uppercaseTag === 'undefined' ? true : pkgConfig.uppercaseTag;
            this.date = typeof pkgConfig.date === 'undefined' ? false : pkgConfig.date;
            this.timestamp = typeof pkgConfig.timestamp === 'undefined' ? true : pkgConfig.timestamp;
            this.filename = typeof pkgConfig.filename === 'undefined' ? true : pkgConfig.filename;
            this.longestFileName = typeof pkgConfig.setFileLength === 'undefined' ? 0 : pkgConfig.setFileLength + 2;
            this.longestTagName = typeof pkgConfig.setTagLength === 'undefined' ? 0 : pkgConfig.setTagLength + 2;
            for (let logger in pkgConfig.loggers) {
                if  (!pkgConfig.loggers.hasOwnProperty(logger)) continue;
                this.loggers[logger] = pkgConfig.loggers[logger];
            }
        }

        this.tag = options.tag || this.tag;
        this.interactive = options.interactive || this.interactive;
        this.uppercaseTag = options.uppercaseTag || this.uppercaseTag;
        this.date = options.date || this.date;
        this.timestamp = options.timestamp || this.timestamp;
        this.filename = options.filename || this.filename;
        this.longestFileName = options.setFileLength + 2 || this.longestFileName;
        this.longestTagName = options.setTagLength + 2 || this.longestTagName;

        for (let logger in options.loggers) {
            if  (!options.loggers.hasOwnProperty(logger)) continue;
            this.loggers[logger] = options.loggers[logger];
        }

        Object.keys(this.loggers).forEach(type => {
            this[type] = this.logger.bind(this, type);
        });

    }

    private get dateFormat () : string {
        return this.date ? `[${moment().format('DD.MM.YY')}] ` : '';
    }

    private get timestampFormat () : string {
        return this.timestamp ? `[${moment().format('HH:mm:ss')}] ` : '';
    }

    private get filenameFormat () : string {
        const _ = Error.prepareStackTrace;
        Error.prepareStackTrace = (error, stack) => stack;
        const {stack} = new Error();
        Error.prepareStackTrace = _;

        const callers = (stack as any).map(x => x.getFileName());

        const firstExternalFilePath = callers.find(x => {
            return x !== callers[0];
        });

        return this.filename ? (firstExternalFilePath ? path.basename(firstExternalFilePath) : 'anonymous') : '';
    }

    private get filenameFormatS() : string {
        return this.filename ? pad(`[${this.filenameFormat}] `, this.longestFileName ) : '';
    }

    private get tagFormat () : string {
        return pad(this.uppercaseTag ? `[${this.tag.toUpperCase()}]` : `[${this.tag}]`, this.longestTagName);
    }

    private color (type: string) : string {
        return this.loggers[type].color;
    }

    private logger (type: string, msg: string, ...args: string[]) : void {

        let color = this.color(type);

        msg = msg.replace(/%a/g, () => chalk[color](args.shift()));

        let final = chalk.gray(`${this.dateFormat}${this.timestampFormat}${this.filenameFormatS}${this.tagFormat} `) + chalk[color].bold(pad(type.toUpperCase(), 10)) + `: ${msg}`;
        this.write(final);

    }

    private write (content: string) : void {

        if (this.interactive && this.before) {
            readline.moveCursor(this.stream, 0, -1);
            readline.clearLine(this.stream, 0);
            readline.cursorTo(this.stream, 0);
        }
        this.stream.write(content + '\n');
        this.before = true;

    }

}
