import {
    FreEditClassifierProjection, FreEditExternalInfo, FreEditExternalProjection,
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
                } else if (item instanceof FreEditExternalProjection) {
                    result.push(item.externalInfo);
                }
            });
        });
        return result;
    }

    /**
     * Returns the 'positionInProjection' part of an expression like 'SMUI_Card:Second' (i.e. 'Second')
     * for all occurrences of external projections or property projections that are marked 'external',
     * and have the name 'externalName'.
     * @param externalName
     */
    findPositionsOfExternal(externalName: string): string[] {
        const result: string[] = [];
        this.lines.forEach(line => {
            line.items.forEach(item => {
                let foundOne: FreEditExternalInfo | undefined = undefined;
                if (item instanceof FreEditPropertyProjection && !!item.externalInfo) {
                    foundOne = item.externalInfo;
                } else if (item instanceof FreEditExternalProjection) {
                    foundOne = item.externalInfo;
                }
                if (!!foundOne && foundOne.externalName === externalName && !!foundOne.positionInProjection) {
                    result.push(foundOne.positionInProjection);
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
