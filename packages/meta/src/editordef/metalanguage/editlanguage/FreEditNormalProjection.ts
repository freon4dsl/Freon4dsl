import {
    FreEditClassifierProjection,
    FreEditExternalInfo,
    FreEditSimpleExternal,
    FreEditProjectionLine,
    FreEditPropertyProjection,
} from "./internal.js";
import { FreEditFragmentProjection } from "./FreEditFragmentProjection.js";

/**
 * A 'normal', i.e. not a table projection, for a concept or interface
 */
export class FreEditNormalProjection extends FreEditClassifierProjection {
    lines: FreEditProjectionLine[] = [];

    findAllPartProjections(): FreEditPropertyProjection[] {
        const result: FreEditPropertyProjection[] = [];
        this.lines.forEach((line) => {
            line.items.forEach((item) => {
                if (item instanceof FreEditPropertyProjection) {
                    result.push(item);
                }
            });
        });
        this.fragmentDefinitions.forEach((fragmentDef) => {
            result.push(...fragmentDef.childProjection.findAllPartProjections());
        });
        return result;
    }

    /**
     * Returns all fragment projections including those in fragment definitions.
     */
    findAllFragmentProjections(): FreEditFragmentProjection[] {
        const result: FreEditFragmentProjection[] = this.findMainFragmentProjections();
        this.fragmentDefinitions.forEach((fragmentDef) => {
            result.push(...fragmentDef.childProjection.findAllFragmentProjections());
        });
        return result;
    }

    /**
     * Returns only the fragment projections in the 'main' projection.
     */
    findMainFragmentProjections(): FreEditFragmentProjection[] {
        const result: FreEditFragmentProjection[] = [];
        this.lines.forEach((line) => {
            line.items.forEach((item) => {
                if (item instanceof FreEditFragmentProjection) {
                    result.push(item);
                }
            });
        });
        return result;
    }

    findAllExternals(): FreEditExternalInfo[] {
        const result: FreEditExternalInfo[] = [];
        this.lines.forEach((line) => {
            line.items.forEach((item) => {
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
        return `${this.classifier?.name ? `${this.classifier?.name}` : ``} {
        [ // #lines: ${this.lines.length}
        ${this.lines.map((line) => line.toString()).join("\n")}
        ]}`;
    }
}
