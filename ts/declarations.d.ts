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
interface Charlog {
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
