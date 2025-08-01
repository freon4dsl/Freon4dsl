import * as fs from "fs";
import * as path from "path";

export class FileUtil {
    public static separator(): string {
        return path.sep;
    }

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

    /**
     * Reads a string from the file located at 'filepath'. If the
     * file is not present an Error will be thrown.
     * @param filepath
     */
    public static stringFromFile(filepath: string): string {
        // read language file
        let startPath = './packages/samples/FreLanguage/src/__inputs__/';
        let actualPath = startPath + filepath
        if (!FileUtil.exists(actualPath)) {
            console.error(this, "File '" + actualPath + "' does not exist, exiting.");
            throw new Error(`File '${actualPath}' not found.`);
        }
        const result = fs.readFileSync(actualPath, { encoding: "utf8" });
        return result;
    }

    /**
     * Writes a string to the file located at 'filepath'. If the
     * file is not present it will be created.
     * May throw an Error if the file cannot be written or created.
     * @param filepath
     * @param output
     */
    public static stringToFile(filepath: string, output: string) {
        if (FileUtil.exists(filepath)) {
            console.log(this, "FileHandler: file " + filepath + " already exists, overwriting it.");
        }
        fs.writeFileSync(filepath, output);
    }
}
