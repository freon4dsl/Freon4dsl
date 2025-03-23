import * as fs from "fs";

export class FileHandler {

    /**
     * Reads a string from the file located at 'filepath'. If the
     * file is not present an Error will be thrown.
     * @param filepath
     */
    public stringFromFile(filepath: string): string {
        // read language file
        let startPath = './packages/samples/Insurance/src/__inputs__/';
        let actualPath = startPath + filepath
        if (!fs.existsSync(actualPath)) {
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
    public stringToFile(filepath: string, output: string) {
        if (fs.existsSync(filepath)) {
            console.log(this, "FileHandler: file " + filepath + " already exists, overwriting it.");
        }
        fs.writeFileSync(filepath, output);
    }
}
