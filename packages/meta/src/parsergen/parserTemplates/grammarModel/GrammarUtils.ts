import { PiClassifier, PiPrimitiveType } from "../../../languagedef/metalanguage";
import { Names } from "../../../utils";
import { ChoiceRuleMaker } from "../ChoiceRuleMaker";

export function getPrimCall(propType: PiClassifier): string {
    switch (propType) {
        case PiPrimitiveType.string: {
            return "stringLiteral";
        }
        case PiPrimitiveType.identifier: {
            return "identifier";
        }
        case PiPrimitiveType.number: {
            return "numberLiteral";
        }
        case PiPrimitiveType.boolean: {
            return "booleanLiteral";
        }
        default:
            return "stringLiteral";
    }
}

export function getTypeCall(propType: PiClassifier): string {
    const result = ChoiceRuleMaker.superNames.get(propType);
    if (!!result && result.length > 0) {
        return result;
    } else {
        return Names.classifier(propType);
    }
}

export const refSeparator: string = "::";
export const refRuleName: string = "__pi_reference";

export function makeIndent(depth: number) {
    let indent: string = "\n";
    for (let i = depth; i >= 1; i--) {
        indent += "\t";
    }
    return indent;
}
