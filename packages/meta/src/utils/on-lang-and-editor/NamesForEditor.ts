import type {
    FreEditClassifierProjection, FreEditFragmentDefinition,
    FreEditProjectionGroup,
    FreEditTableProjection,
} from "../../editordef/metalanguage/index.js";
import type { FreMetaClassifier } from '../../languagedef/metalanguage/index.js';

/**
 * Defines all names that are used in the generation, to ensure they are identical
 * at each usage.
 */
export class NamesForEditor {

    public static projection(group: FreEditProjectionGroup): string {
        return group.name;
    }

    public static projectionMethod(proj: FreEditClassifierProjection): string {
        return "get" + this.startWithUpperCase(proj.name);
    }

    public static tableProjectionMethod(proj: FreEditClassifierProjection): string {
        return "get" + this.startWithUpperCase(proj.name);
    }

    public static tableHeadersMethod(proj: FreEditTableProjection): string {
        return "getHeadersFor" + this.startWithUpperCase(proj.name);
    }

    public static binaryProjectionFunction(): string {
        return "_getBinaryExpressionBox";
    }

    public static boxProvider(concept: FreMetaClassifier): string {
        return this.startWithUpperCase(concept.name) + "BoxProvider";
    }

    static fragment(fragmentDefinition: FreEditFragmentDefinition) {
        return "getFragmentBox_" + fragmentDefinition.name;
    }

    private static startWithUpperCase(word: string): string {
        if (!!word) {
            return word[0].toUpperCase() + word.substring(1);
        }
        return "";
    }
}
