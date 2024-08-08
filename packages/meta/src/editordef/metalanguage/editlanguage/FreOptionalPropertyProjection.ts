import {FreEditPropertyProjection, FreEditProjectionLine, FreEditProjectionText} from "./internal.js";

/**
 * An element of a line in a projection definition that represents the projection of a property that is optional.
 */
export class FreOptionalPropertyProjection extends FreEditPropertyProjection {
    lines: FreEditProjectionLine[] = [];

    public findPropertyProjection(): FreEditPropertyProjection | undefined {
        let result: FreEditPropertyProjection | undefined = undefined;
        this.lines.forEach(l => {
            if (!result) {
                result = l.items.find(item => item instanceof FreEditPropertyProjection) as FreEditPropertyProjection;
            }
        });
        return result;
    }

    /**
     * Returns the first literal word in the sub projection.
     * Returns the empty string "" if there is no such literal.
     */
    public firstLiteral(): string {
        for (const line of this.lines) {
            for (const item of line.items) {
                if (item instanceof FreEditProjectionText) {
                    return item.text.trim();
                }
            }
        }
        return "";
    }

    toString(): string {
        return `[?
        // #lines ${this.lines.length}
            ${this.lines.map(line => line.toString()).join("\n")}\`;
        ]`;
    }
}
