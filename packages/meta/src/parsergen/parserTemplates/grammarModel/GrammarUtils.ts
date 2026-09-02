import { FreMetaClassifier, FreMetaProperty } from "../../../languagedef/metalanguage/index.js"
import { FreMetaPrimitiveType } from "../../../languagedef/metalanguage/index.js";
import { Names } from "../../../utils/on-lang/index.js";
import { ChoiceRuleMaker } from "../ChoiceRuleMaker.js";
import { langiumPrefix } from "../LangiumGrammarGenerator.js"
import { isNullOrUndefined } from "../../../utils/file-utils/index.js"

export function getPrimCall(propType: FreMetaClassifier, optional: boolean = false): string {
    switch (propType) {
        case FreMetaPrimitiveType.string: {
            return optional ? "optStringLiteral" : "stringLiteral"
        }
        case FreMetaPrimitiveType.identifier: {
            return optional ? "optIdentifier" : "identifier"
        }
        case FreMetaPrimitiveType.number: {
            return optional ? "optNumberLiteral" : "numberLiteral"
        }
        case FreMetaPrimitiveType.boolean: {
            return optional ? "optBooleanLiteral" : "booleanLiteral"
        }
        default:
            return optional ? "optStringLiteral" : "stringLiteral"
    }
}

export function getLangiumPrimCall(propType: FreMetaClassifier, optional: boolean = false): string {
    switch (propType) {
        case FreMetaPrimitiveType.string: {
            return optional ? "optStringLiteral" : "STRING_LITERAL "
        }
        case FreMetaPrimitiveType.identifier: {
            return optional ? "optIdentifier" : "IDENTIFIER"
        }
        case FreMetaPrimitiveType.number: {
            return optional ? "optNumberLiteral" : "NUMBER_LITERAL"
        }
        case FreMetaPrimitiveType.boolean: {
            return optional ? "optBooleanLiteral" : "BooleanLiteral"
        }
        default:
            return optional ? "optStringLiteral" : "STRING_LITERAL"
    }
}

export function getTypeCall(propType: FreMetaClassifier, projectionName?: string): string {
    const result = ChoiceRuleMaker.superNames.get(propType)
    if (!!result && result.length > 0) {
        return result
    } else {
        if (!!projectionName && projectionName.length > 0) {
            return Names.classifier(propType) + "_" + projectionName + "Rule"
        }
        return Names.classifier(propType) + "Rule"
    }
}

export function getLangiumRuleName(propType: FreMetaClassifier, projectionName?: string): string {
    return langiumPrefix + getTypeCall(propType, projectionName);
}

export function getAssignmentName(prop: FreMetaProperty): string {
    return prop.name;
}

export function getLangiumTypeName(cls: FreMetaClassifier | undefined) {
    if (isNullOrUndefined(cls)) {
        return "noName"
    } else {
        return langiumPrefix + cls.name
    }
}

export const refRuleName: string = "__fre_reference";

export const langiumRefRuleName: string = "FreReference"

export function makeIndent(depth: number) {
    let indent: string = "\n";
    for (let i = depth; i >= 1; i--) {
        indent += "\t";
    }
    return indent;
}
