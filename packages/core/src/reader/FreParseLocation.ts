import { notNullOrUndefined } from "../util/index.js"

/**
 * This class is used to store the location information from the AGL parser.
 */
export class FreParseLocation {
    static create(data: Partial<FreParseLocation>): FreParseLocation {
        const result = new FreParseLocation();
        if (notNullOrUndefined(data.filename)) {
            result.filename = data.filename;
        }
        if (notNullOrUndefined(data.line)) {
            result.line = data.line;
        }
        if (notNullOrUndefined(data.column)) {
            result.column = data.column;
        }
        return result;
    }
    filename: string;
    line: number;
    column: number;

    private constructor() {}
}
