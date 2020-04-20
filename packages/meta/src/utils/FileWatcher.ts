import * as fs from "fs";

export class FileWatcher {
    filename: string;
    lastChanged: number = 0;
    callback: () => void;

    constructor(filename: string, callback: () => void) {
        this.filename = filename;
        this.callback = callback;
        fs.watch(filename, this.fileWatcher);
    }

    fileWatcher = (event: string, filename: string) => {
        const timestamp = fs.statSync(this.filename).mtimeMs;
        const process = this.lastChanged !== timestamp;
        this.lastChanged = timestamp;
        console.log("Change in file [" + filename + "] event [" + event + "] stats [" + timestamp + "] process [" + process + "]");
        if (process) {
            this.callback();
        }
    };
}
