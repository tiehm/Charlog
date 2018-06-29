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
