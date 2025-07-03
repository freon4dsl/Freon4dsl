import fs from "fs";

/**
 * Worker that is called for each file and directory by the DirectoryWalker.
 */
export interface DirectoryWorker {
    /**
     * Called on each directory `dir` by the DirectoryWalker.
     * This is called **before** visiting the contents of `dir`
     * @param dir
     */
    visitDir(dir: string): void

    /**
     * Called on each file `file` by the DirectoryWalker.
     * @param dir
     */
    visitFile(file: string): void

    /**
     * Called on each directory `dir` by the DirectoryWalker.
     * This is called **after** visiting the contents of `dir`
     * @param dir
     */
    visitDirAfter(dir: string): void
}

/**
 * Walker that goes through all files and directories, starting at a giver directory.
 * For each file and directory a DirectoiryWorker is called.
 */
export class DirectoryWalker {
    worker: DirectoryWorker

    constructor(worker: DirectoryWorker) {
        this.worker = worker
    }

    walk(dir: string): void {
        if(FileUtil.exists(dir)) {
            if (fs.lstatSync(dir).isDirectory()) {
                this.worker.visitDir(dir)
                const files = fs.readdirSync(dir)
                for (const file of files) {
                    this.walk(dir + "/" + file)
                }
                this.worker.visitDirAfter(dir)
            } else if (fs.lstatSync(dir).isFile()) {
                this.worker.visitFile(dir)
            }
        }
    }
}
