import { FreClassifier, FrePrimitiveType } from "../../../languagedef/metalanguage";
import { Names } from "../../../utils";
import { ChoiceRuleMaker } from "../ChoiceRuleMaker";

export function getPrimCall(propType: FreClassifier): string {
    switch (propType) {
        case FrePrimitiveType.string: {
            return "stringLiteral";
        }
        case FrePrimitiveType.identifier: {
            return "identifier";
        }
        case FrePrimitiveType.number: {
            return "numberLiteral";
        }
        case FrePrimitiveType.boolean: {
            return "booleanLiteral";
        }
        default:
            return "stringLiteral";
    }
}

export function getTypeCall(propType: FreClassifier, projectionName?: string): string {
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
