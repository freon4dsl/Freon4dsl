import {
    PiEditParsedNewline,
    PiEditParsedProjectionIndent,
    PiEditProjection,
    PiEditProjectionLine
} from "../metalanguage";

export class PiEditParseUtil {

    /** Normalizing means:
     * - break lines at newline,
     * - remove empty lines
     * - set indent property per line and then remove all indent items
     * - All PiEditParseNewline and PiEditParseProjectionIndent instances are removed.
     */
    public static normalize(projection: PiEditProjection): void {
        const result: PiEditProjectionLine[] = [];
        let currentLine = new PiEditProjectionLine();
        const lastItemIndex = projection.lines[0].items.length - 1;
        // TODO Empty lines are discarded now, decide how to handle them in general
        projection.lines[0].items.forEach((item, index) => {
            if (item instanceof PiEditParsedProjectionIndent) {
                item.normalize();
            }
            if (item instanceof PiEditParsedNewline) {
                if (currentLine.isEmpty()) {
                    currentLine = new PiEditProjectionLine();
                } else {
                    result.push(currentLine);
                    currentLine = new PiEditProjectionLine();
                }
            } else {
                currentLine.items.push(item);
            }
            if (lastItemIndex === index) {
                // push last line if not empty
                if (!currentLine.isEmpty()) {
                    result.push(currentLine);
                }
            }
        });
        projection.lines = result;

        let ignoredIndent = 0;
        // find the ignored indent value
        projection.lines.forEach(line => {
            const firstItem = line.items[0];
            if (firstItem instanceof PiEditParsedProjectionIndent) {
                ignoredIndent = ignoredIndent === 0 ? firstItem.amount : Math.min(ignoredIndent, firstItem.amount);
            }
        });
        // find indent of first line and substract that from all other lines
        // set indent of each line to the remainder
        projection.lines.forEach(line => {
            const firstItem = line.items[0];
            if (firstItem instanceof PiEditParsedProjectionIndent) {
                // const indent = firstItem.amount - ignoredIndent;
                line.indent = firstItem.amount - ignoredIndent;
                line.items.splice(0, 1);
            }
        });
        // remove all indent items, as they are not needed anymore
        projection.lines.forEach(line => {
            line.items = line.items.filter(item => !(item instanceof PiEditParsedProjectionIndent));
        });
    }

}
