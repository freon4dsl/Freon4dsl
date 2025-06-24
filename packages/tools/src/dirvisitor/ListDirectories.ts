import { DirectoryWorker } from "./DirectoryWalker";

/**
 * Worker that prints a line for each directory and file visited by a DirectoryWalker.
 */
export class ListDirectoriesWorker implements DirectoryWorker {
    dirs: string[]= []
    
    visitDir(dir: string): void {
        this.dirs.push(dir)
        console.log(`Visit dir ${dir}` )
    }

    visitFile(file: string): void {
        console.log(`Visit file ${this.dirs.join("/")} => ${file}` )
    }

    visitDirAfter(dir: string): void {
        this.dirs.pop()
    }    
}
