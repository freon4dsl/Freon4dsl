import type { FreMetaClassifier, FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { Names } from "../../../utils/on-lang/index.js";
import { FreMetaDefinitionElement } from "../../../utils/no-dependencies/index.js";
import type {
    FreEditProjectionGroup,
    FreEditClassifierProjection,
    FreEditTableProjection,
    FreEditExtraClassifierInfo,
} from "./internal.js";

/**
 * The root of the complete editor definition
 */
export class FreEditUnit extends FreMetaDefinitionElement {
    language: FreMetaLanguage | undefined;
    projectiongroups: FreEditProjectionGroup[] = [];
    classifiersUsedInSuperProjection: string[] = []; // holds the names of all classifiers that are refered in an FreEditSuperProjection

    getDefaultProjectiongroup(): FreEditProjectionGroup | undefined {
        return this.projectiongroups.find((group) => group.name === Names.defaultProjectionName);
    }

    /**
     * Returns a list of all projection groups except the default group, sorted by their precedence.
     * Lowest precedence first!
     */
    getAllNonDefaultProjectiongroups(): FreEditProjectionGroup[] {
        const result: FreEditProjectionGroup[] = this.projectiongroups.filter(
            (group: FreEditProjectionGroup): boolean => group.name !== Names.defaultProjectionName,
        );
        result.sort((a: FreEditProjectionGroup, b: FreEditProjectionGroup): number => {
            if (a.precedence !== undefined && b.precedence !== undefined) {
                return a.precedence - b.precedence;
            } else {
                return 0;
            }
        });
        return result;
    }

    findProjectionsForType(cls: FreMetaClassifier): FreEditClassifierProjection[] {
        const result: FreEditClassifierProjection[] = [];
        for (const group of this.projectiongroups) {
            const found: FreEditClassifierProjection[] = group.findProjectionsForType(cls);
            if (found.length > 0) {
                result.push(...found);
            }
        }
        return result;
    }

    allTableProjections(): FreEditTableProjection[] {
        const result: FreEditTableProjection[] = [];
        for (const group of this.projectiongroups) {
            result.push(...group.allTableProjections());
        }
        return result;
    }

    findTableProjectionsForType(cls: FreMetaClassifier): FreEditTableProjection[] {
        const result: FreEditTableProjection[] = [];
        for (const group of this.projectiongroups) {
            const found = group.findTableProjectionForType(cls);
            if (!!found) {
                result.push(found);
            }
        }
        return result;
    }

    toString(): string {
        return `${this.projectiongroups.map((pr) => pr.toString()).join("\n")}`;
    }

    findExtrasForType(cls: FreMetaClassifier): FreEditExtraClassifierInfo | undefined {
        return this.getDefaultProjectiongroup()?.findExtrasForType(cls);
    }
}
