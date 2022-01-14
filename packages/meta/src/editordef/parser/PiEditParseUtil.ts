import {
    PiEditParsedNewline,
    PiEditParsedProjectionIndent,
    PiEditProjection,
    PiEditProjectionLine,
    PiEditProjectionText,
    PiOptionalPropertyProjection
} from "../metalanguage";

export class PiEditParseUtil {

    /** Normalizing means:
     * - break lines at newline,
     * - remove empty lines
     * - set indent property per line and then remove all indent items
     * - all PiEditParseNewline and PiEditParseProjectionIndent instances are removed.
     */
    public static normalize(projection: PiEditProjection): void {
        // everything is parsed as one line, now break this line on ParsedNewLines and remove empty lines
        projection.lines = PiEditParseUtil.normalizeLine(projection.lines[0]);

        // find the indentation of the complete projection, which should be ignored
        let ignoredIndent = 0;

        // find the line with the least indentation
        projection.lines.forEach(line => {
            const firstItem = line.items[0];
            if (firstItem instanceof PiEditParsedProjectionIndent) {
                ignoredIndent = ignoredIndent === 0 ? firstItem.amount : Math.min(ignoredIndent, firstItem.amount);
            }
            line.items.forEach(item => {
                if (item instanceof PiOptionalPropertyProjection) {
                    item.lines.forEach(subLine => {
                        const firstItem = subLine.items[0];
                        if (firstItem instanceof PiEditParsedProjectionIndent) {
                            ignoredIndent = ignoredIndent === 0 ? firstItem.amount : Math.min(ignoredIndent, firstItem.amount);
                        }
                    });
                }
            });
        });

        // determine the indent of each line, while ignoring the 'ignoredIndent'
        PiEditParseUtil.determineIndents(projection.lines, ignoredIndent);

        // remove all indent items, as they are not needed anymore
        PiEditParseUtil.removeParsedItems(projection.lines);
    }

    private static removeParsedItems(lines: PiEditProjectionLine[]) {
        lines.forEach(line => {
            line.items = line.items.filter(item => !(item instanceof PiEditParsedProjectionIndent));
            line.items.forEach(item => {
                if (item instanceof PiOptionalPropertyProjection) {
                    PiEditParseUtil.removeParsedItems(item.lines);
                }
            });
        });
    }

    private static determineIndents(lines: PiEditProjectionLine[], ignoredIndent: number) {
        // find indent of first line and substract that from all other lines
        // set indent of each line to the remainder
        lines.forEach(line => {
            const firstItem = line.items[0];
            if (firstItem instanceof PiEditParsedProjectionIndent) {
                line.indent = firstItem.amount - ignoredIndent;
                line.items.splice(0, 1);
            }
            line.items.forEach(item => {
                if (item instanceof PiOptionalPropertyProjection) {
                    PiEditParseUtil.determineIndents(item.lines, ignoredIndent);
                }
            })
        });
    }

    private static normalizeLine(line: PiEditProjectionLine): PiEditProjectionLine[] {
        const result: PiEditProjectionLine[] = [];
        let currentLine = new PiEditProjectionLine();
        const lastItemIndex = line.items.length - 1;
        line.items.forEach((item, index) => {
            if (item instanceof PiEditParsedProjectionIndent) {
                item.normalize();
                // add the location to the new line for error messaging
                if (!currentLine.location) {
                    currentLine.location = item.location;
                }
                currentLine.items.push(item);
            } else if (item instanceof PiEditParsedNewline) {
                // make a new line
                result.push(currentLine);
                currentLine = new PiEditProjectionLine();
            } else if (item instanceof PiOptionalPropertyProjection) {
                item.lines = PiEditParseUtil.normalizeLine(item.lines[0]);
                currentLine.items.push(item);
            } else {
                currentLine.items.push(item);
            }
            if (lastItemIndex === index) {
                result.push(currentLine);
            }
        });
        return result;
    }
}
