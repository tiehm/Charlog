"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var readline = require("readline");
var moment = require("moment");
var chalk_1 = require("chalk");
var pad = require("pad");
var Charlog = /** @class */ (function () {
    /**
     *
     * @param {Options} options
     */
    function Charlog(options) {
        if (options === void 0) { options = {}; }
        var _this = this;
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
        this.interactive = false;
        this.uppercaseTag = true;
        this.before = false;
        this.tag = 'MAIN';
        this.date = false;
        this.timestamp = true;
        this.filename = true;
        this.loggers = {
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
        this.longestFileName = 0;
        this.longestTagName = 0;
        this.stream = process.stdout;
        var pkgConfig = JSON.parse(fs.readFileSync(process.cwd() + '/package.json', { encoding: 'utf-8' }));
        var usePkg = !!pkgConfig.charlog;
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
            for (var logger in pkgConfig.loggers) {
                if (!pkgConfig.loggers.hasOwnProperty(logger))
                    continue;
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
        for (var logger in options.loggers) {
            if (!options.loggers.hasOwnProperty(logger))
                continue;
            this.loggers[logger] = options.loggers[logger];
        }
        Object.keys(this.loggers).forEach(function (type) {
            _this[type] = _this.logger.bind(_this, type);
        });
    }
    Object.defineProperty(Charlog.prototype, "dateFormat", {
        get: function () {
            return this.date ? "[" + moment().format('DD.MM.YY') + "] " : '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Charlog.prototype, "timestampFormat", {
        get: function () {
            return this.timestamp ? "[" + moment().format('HH:mm:ss') + "] " : '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Charlog.prototype, "filenameFormat", {
        get: function () {
            var _ = Error.prepareStackTrace;
            Error.prepareStackTrace = function (error, stack) { return stack; };
            var stack = new Error().stack;
            Error.prepareStackTrace = _;
            var callers = stack.map(function (x) { return x.getFileName(); });
            var firstExternalFilePath = callers.find(function (x) {
                return x !== callers[0];
            });
            return this.filename ? (firstExternalFilePath ? path.basename(firstExternalFilePath) : 'anonymous') : '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Charlog.prototype, "filenameFormatS", {
        get: function () {
            return this.filename ? pad("[" + this.filenameFormat + "] ", this.longestFileName) : '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Charlog.prototype, "tagFormat", {
        get: function () {
            return pad(this.uppercaseTag ? "[" + this.tag.toUpperCase() + "]" : "[" + this.tag + "]", this.longestTagName);
        },
        enumerable: true,
        configurable: true
    });
    Charlog.prototype.color = function (type) {
        return this.loggers[type].color;
    };
    Charlog.prototype.logger = function (type, msg) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var color = this.color(type);
        msg = msg.replace(/%a/g, function () { return chalk_1.default[color](args.shift()); });
        var final = chalk_1.default.gray("" + this.dateFormat + this.timestampFormat + this.filenameFormatS + this.tagFormat + " ") + chalk_1.default[color].bold(pad(type.toUpperCase(), 10)) + (": " + msg);
        this.write(final);
    };
    Charlog.prototype.write = function (content) {
        if (this.interactive && this.before) {
            readline.moveCursor(this.stream, 0, -1);
            readline.clearLine(this.stream, 0);
            readline.cursorTo(this.stream, 0);
        }
        this.stream.write(content + '\n');
        this.before = true;
    };
    return Charlog;
}());
exports.Charlog = Charlog;
