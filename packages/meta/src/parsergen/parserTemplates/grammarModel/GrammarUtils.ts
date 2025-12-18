import type { FreMetaClassifier} from "../../../languagedef/metalanguage/index.js";
import { FreMetaPrimitiveType } from "../../../languagedef/metalanguage/index.js";
import { Names } from "../../../utils/on-lang/index.js";
import { ChoiceRuleMaker } from "../ChoiceRuleMaker.js";

export function getPrimCall(propType: FreMetaClassifier, optional: boolean = false): string {
    switch (propType) {
        case FreMetaPrimitiveType.string: {
            return optional ? "optStringLiteral" : "stringLiteral";
        }
        case FreMetaPrimitiveType.identifier: {
            return optional ? "optIdentifier" : "identifier";
        }
        case FreMetaPrimitiveType.number: {
            return optional ? "optNumberLiteral" : "numberLiteral";
        }
        case FreMetaPrimitiveType.boolean: {
            return optional ? "optBooleanLiteral" : "booleanLiteral";
        }
        default:
            return optional ? "optStringLiteral" : "stringLiteral";
    }
}

export function getTypeCall(propType: FreMetaClassifier, projectionName?: string): string {
    const result = ChoiceRuleMaker.superNames.get(propType);
    if (!!result && result.length > 0) {
        return result;
    } else {
        if (!!projectionName && projectionName.length > 0) {
            return Names.classifier(propType) + "_" + projectionName;
        }
        return Names.classifier(propType);
    }
}

export const refRuleName: string = "__fre_reference";

export function makeIndent(depth: number) {
    let indent: string = "\n";
    for (let i = depth; i >= 1; i--) {
        indent += "\t";
    }
    return indent;
}
