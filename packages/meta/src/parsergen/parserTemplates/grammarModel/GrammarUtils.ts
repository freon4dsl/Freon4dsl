import { FreMetaClassifier, FreMetaPrimitiveType } from "../../../languagedef/metalanguage";
import { Names } from "../../../utils";
import { ChoiceRuleMaker } from "../ChoiceRuleMaker";

export function getPrimCall(propType: FreMetaClassifier): string {
    switch (propType) {
        case FreMetaPrimitiveType.string: {
            return "stringLiteral";
        }
        case FreMetaPrimitiveType.identifier: {
            return "identifier";
        }
        case FreMetaPrimitiveType.number: {
            return "numberLiteral";
        }
        case FreMetaPrimitiveType.boolean: {
            return "booleanLiteral";
        }
        default:
            return "stringLiteral";
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
