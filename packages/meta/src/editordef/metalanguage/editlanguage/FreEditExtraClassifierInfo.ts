import { FreMetaDefinitionElement } from "../../../utils/no-dependencies/index.js";
import {
    FreLangExp,
    FreMetaClassifier,
    FreMetaProperty,
    MetaElementReference,
} from "../../../languagedef/metalanguage/index.js";

/**
 * Holds extra information, defined in the default editor, per classifier
 */
export class FreEditExtraClassifierInfo extends FreMetaDefinitionElement {
    classifier: MetaElementReference<FreMetaClassifier> | undefined;
    // The string that triggers the creation of an object of this class in the editor.
    trigger: string = "";
    // The property to be used when an element of type 'classifier' is used within a reference.
    referenceShortCut?: MetaElementReference<FreMetaProperty> = undefined;
    // The parsed expression that refers to the referenceShortcut. Deleted during checking!
    referenceShortcutExp?: FreLangExp = undefined;
    // Only for binary expressions: the operator between left and right parts.
    symbol: string = "";

    toString(): string {
        return `${this.classifier?.name} {
            trigger = ${this.trigger}
            symbol = ${this.symbol}
            referenceShortcut = ${this.referenceShortCut ? this.referenceShortCut.name : this.referenceShortcutExp}
        }`;
    }
}
