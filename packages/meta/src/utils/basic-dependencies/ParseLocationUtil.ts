import { FreMetaDefinitionElement, ParseLocation } from '../no-dependencies/FreMetaDefinitionElement.js';

export class ParseLocationUtil {
    static defaultParseLocation: ParseLocation = {
        filename: "filename unknown",
        start: {
            offset: 1,
            line: 1,
            column: 1,
        },
        end: {
            offset: 1,
            line: 1,
            column: 1,
        },
    };
    static location(elem: FreMetaDefinitionElement | undefined): string {
        if (!!elem) {
            if (!!elem.location && !!elem.location.filename) {
                const shortFileName: string = ParseLocationUtil.getShortFileName(elem.location.filename);
                return `[file: ${shortFileName}:${elem.location.start.line}:${elem.location.start.column}]`;
            } else if (!!elem.aglParseLocation && !!elem.aglParseLocation.filename) {
                const shortFileName: string = ParseLocationUtil.getShortFileName(elem.aglParseLocation.filename);
                return `[file: ${shortFileName}:${elem.aglParseLocation.line}:${elem.aglParseLocation.column}]`;
            }
        }
        return `[no location]`;
    }

    static locationPlus(fileName: string, location: ParseLocation) {
        if (!!location && !!fileName) {
            const shortFileName: string = this.getShortFileName(fileName);
            return `[file: ${shortFileName}:${location.start.line}:${location.start.column}]`;
        }
        return `[no location]`;
    }

    /**
     * Extracts the file name from a full path.
     * Works with both Unix-style '/' and Windows-style '\' separators.
     *
     * @param filename - The full path to a file.
     * @returns The last part of the path, i.e. the file name.
     *
     * @example
     * getShortFileName("C:\\foo\\bar/test.txt"); // "test.txt"
     * getShortFileName("/usr/local/bin/script.sh"); // "script.sh"
     */
    private static getShortFileName(filename: string): string {
        // Split the path into parts, using both '\' (Windows) and '/' (Unix) as separators.
        const parts = filename.split(/[\\/]/);

        // Return the last element, which should be the actual file name.
        // If splitting somehow fails (empty string), fall back to the original input.
        return parts[parts.length - 1] || filename;
    }
}
