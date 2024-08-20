/**
 * This class is used to store the location information from the AGL parser.
 */
export class FreParseLocation {
    static create(data: Partial<FreParseLocation>): FreParseLocation {
        const result = new FreParseLocation();
        if (!!data.filename) {
            result.filename = data.filename;
        }
        if (!!data.line) {
            result.line = data.line;
        }
        if (!!data.column) {
            result.column = data.column;
        }
        return result;
    }
    filename: string;
    line: number;
    column: number;

    private constructor() {}
}
