import {
    FreEditExtraClassifierInfo,
    FreEditClassifierProjection,
    FreEditNormalProjection,
    FreEditTableProjection
} from "./internal.js";
import {FreMetaDefinitionElement} from "../../../utils/index.js";

/**
 * This class is only used during parsing. It is removed from the model in the creation phase (in FreEditCreators.extractProjections).
 */
export class FreEditParsedClassifier extends FreEditClassifierProjection {
    projection?: FreEditNormalProjection = undefined;
    tableProjection?: FreEditTableProjection = undefined;
    classifierInfo?: FreEditExtraClassifierInfo = undefined;
    toString(): string {
        return `ParsedClassifier ${this.classifier?.name}`;
    }
}
/**
 * This class is only used by the parser and removed from the edit model after normalization in FreEditChecker.normalize.
 */
export class FreEditParsedNewline {
    toString(): string {
        return "\n";
    }
}

/**
 * This class is only used by the parser and removed from the edit model after normalization in FreEditChecker.normalize.
 */
export class FreEditParsedProjectionIndent extends FreMetaDefinitionElement {
    indent: string = "";
    amount: number = 0;

    toString(): string {
        if (this.amount === 0) {
            return "_0";
        }
        return this.indent.replace(/ /g, "_") + this.amount;
    }
}
