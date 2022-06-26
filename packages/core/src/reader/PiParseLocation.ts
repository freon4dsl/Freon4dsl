/**
 * This class is used to store the location information from the AGL parser.
 */
export class PiParseLocation {
    filename: string;
    line: number;
    column: number;

    static create(data: Partial<PiParseLocation>): PiParseLocation {
        const result = new PiParseLocation();
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

    private constructor() {
    }
}
