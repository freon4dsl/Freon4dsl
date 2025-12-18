import type { FreMetaClassifier } from "../../../languagedef/metalanguage/index.js";
import { FreMetaDefinitionElement } from "../../../utils/no-dependencies/index.js";
import type {
    FreEditClassifierProjection,
    FreEditGlobalProjection,
    FreEditExtraClassifierInfo,
    FreEditUnit,
    ForType} from "./internal.js";
import {
    FreEditTableProjection,
    FreEditNormalProjection
} from "./internal.js";

/**
 * A group of projection definitions that share the same name
 */
export class FreEditProjectionGroup extends FreMetaDefinitionElement {
    name: string = "";
    projections: FreEditClassifierProjection[] = [];
    globalProjections: FreEditGlobalProjection[] = []; // may only be present in default group
    extras: FreEditExtraClassifierInfo[] = []; // may only be present in default group, todo change type to ... | undefined
    owningDefinition: FreEditUnit | undefined;
    precedence: number | undefined;

    findProjectionsForType(cls: FreMetaClassifier): FreEditClassifierProjection[] {
        let tmp: FreEditClassifierProjection[] | undefined = this.projections.filter(
            (con: FreEditClassifierProjection): boolean => con.classifier?.referred === cls,
        );
        if (tmp === undefined) {
            tmp = [];
        }
        return tmp;
    }

    findTableProjectionForType(cls: FreMetaClassifier): FreEditTableProjection | undefined {
        return this.allTableProjections().find((con) => con.classifier?.referred === cls);
    }

    findNonTableProjectionForType(cls: FreMetaClassifier): FreEditNormalProjection | undefined {
        return this.allNonTableProjections().find((con) => con.classifier?.referred === cls);
    }

    findExtrasForType(cls: FreMetaClassifier): FreEditExtraClassifierInfo | undefined {
        if (!!this.extras) {
            return this.extras.find((con) => con.classifier?.referred === cls);
        } else {
            return undefined;
        }
    }

    allTableProjections(): FreEditTableProjection[] {
        return this.projections.filter((con) => con instanceof FreEditTableProjection) as FreEditTableProjection[];
    }

    allNonTableProjections(): FreEditNormalProjection[] {
        return this.projections.filter((con) => con instanceof FreEditNormalProjection) as FreEditNormalProjection[];
    }

    toString(): string {
        let globalStr: string = "";
        if (!!this.globalProjections && this.globalProjections.length > 0) {
            globalStr = `\nglobals { 
    ${this.globalProjections?.map((pr) => pr.toString()).join("\n")}
}`;
        }
        return `editor ${this.name}${globalStr}
        ${this.projections?.map((gr) => gr.toString()).join("\n")}

        ${this.extras?.map((gr) => gr.toString()).join("\n")}`;
    }

    findGlobalProjFor(kind: ForType): FreEditGlobalProjection | undefined {
        return this.globalProjections.find((con) => con.for === kind);
    }
}
