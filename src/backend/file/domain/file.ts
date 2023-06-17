
export class FileInfo {
    constructor (
        readonly fileId: string,
        readonly uploadUserId: string,
        readonly title: string,
        readonly description: string,
        readonly fileName: string,
        readonly filePath: string
    ) { }
}