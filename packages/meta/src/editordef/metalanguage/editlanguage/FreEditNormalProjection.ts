import {
    FreEditClassifierProjection, FreEditExternalInfo, FreEditSimpleExternal,
    FreEditProjectionLine,
    FreEditPropertyProjection
} from "./internal.js";

/**
 * A 'normal', i.e. not a table projection, for a concept or interface
 */
export class FreEditNormalProjection extends FreEditClassifierProjection {
    lines: FreEditProjectionLine[] = [];

    findAllPartProjections(): FreEditPropertyProjection[] {
        const result: FreEditPropertyProjection[] = [];
        this.lines.forEach(line => {
            line.items.forEach(item => {
                if (item instanceof FreEditPropertyProjection) {
                    result.push(item);
                }
            });
        });
        return result;
    }

    findAllExternals(): FreEditExternalInfo[] {
        const result: FreEditExternalInfo[] = [];
        this.lines.forEach(line => {
            line.items.forEach(item => {
                if (item instanceof FreEditPropertyProjection && !!item.externalInfo) {
                    result.push(item.externalInfo);
                } else if (item instanceof FreEditSimpleExternal) {
                    // result.push(item.externalInfo);
                    // todo
                }
            });
        });
        return result;
    }

    toString() {
        return `${this.classifier?.name} {
        [ // #lines: ${this.lines.length}
        ${this.lines.map(line => line.toString()).join("\n")}
        ]}`;
    }
}
