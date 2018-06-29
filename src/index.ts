import * as path     from 'path';
import * as readline from 'readline';
import * as moment   from 'moment';
import chalk         from 'chalk';
import * as pad      from 'pad';

export class Charlog {

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

    private readonly interactive: boolean = false;
    private readonly uppercaseTag: boolean = true;
    private before: boolean = false;
    private readonly tag: string;
    private readonly date: boolean = true;
    private readonly timestamp: boolean;
    private readonly filename: boolean = true;
    private loggers: {
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
        }
    };
    private readonly longestFileName: number;
    private readonly longestTagName: number;
    private stream = process.stdout;

    /**
     *
     * @param {Options} options
     */
    constructor (options: Options = {}) {

        this.tag = options.tag || 'MAIN';
        this.interactive = options.interactive || false;
        this.uppercaseTag = options.uppercaseTag || true;
        this.date = options.date || false;
        this.timestamp = options.timestamp || false;
        this.filename = options.filename || true;
        this.longestFileName = options.setFileLength + 2 || 0;
        this.longestTagName = options.setTagLength + 2 || 0;

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

    private color (type: string) : string {
        return this.loggers[type].color;
    }

    private get tagFormat () : string {
        return pad(this.uppercaseTag ? `[${this.tag.toUpperCase()}]` : `[${this.tag}]`, this.longestTagName);
    }



    private logger (type: string, msg: string, ...args: string[]) : void {

        let color = this.color(type);

        msg = msg.replace(/%a/g, () => chalk[color](args.shift()));

        let final = chalk.gray(`${this.dateFormat}${this.timestampFormat}${this.filenameFormatS}${this.tagFormat} `) + chalk[color].bold(pad(type.toUpperCase(), 10)) + `: ${msg}`;
        this.write(final);

    }

    private write (content: string) {

        if (this.interactive && this.before) {
            readline.moveCursor(this.stream, 0, -1);
            readline.clearLine(this.stream, 0);
            readline.cursorTo(this.stream, 0);
        }
        this.stream.write(content + '\n');
        this.before = true;

    }

}
