import * as fs from "fs";

export class FileUtil {

    /**
     * Return true if `file` exists in the file system
     * @param file
     */
    public static exists(file: string): boolean {
        try {
            fs.statSync(file)
            return true
        } catch (e) {
            return false
        }
    }
}
