import {
    FreMetaClassifier,
    FreMetaConcept,
    FreMetaInterface,
    FreMetaLanguage,
    FreMetaLimitedConcept,
    FreMetaPrimitiveType,
    FreMetaProperty,
    FreMetaUnitDescription,
} from "../../languagedef/metalanguage/index.js"
import { notNullOrUndefined } from "../../utils/file-utils/index.js"
import { langiumPrefix } from "./LangiumGrammarGenerator.js"


export class LangiumTypesMaker {
    // TODO The interfaces needed for the Langium grammar are now included in file containing the grammar,
    //  e.g. LionCore_M3Grammar.langium.
    //  As Langium uses all .langium files in its input folder as one input, we could also generate these
    //  type declarations into another file with extension .langium.
    public makeLangiumDeclarations(language: FreMetaLanguage): string {
        let result: string = ""
        for (const xx of language.classifiers()) {
            if (xx instanceof FreMetaInterface) {
                let extendsClause: string = ""
                if (xx.base.length > 0) {
                    extendsClause = "extends " + xx.base.map((base) => langiumPrefix + base.name).join(", ")
                }
                result += `interface ${langiumPrefix}${xx.name} ${extendsClause} {   
    ${this.makeLangiumProperties(xx)}
}\n`
            } else if (xx instanceof FreMetaConcept) {
                let extendsClause: string = ""
                if (notNullOrUndefined(xx.base)) {
                    extendsClause = "extends " + langiumPrefix + xx.base.name + " "
                }
                if (xx.interfaces.length > 0) {
                    if (extendsClause.length === 0) {
                        extendsClause += "extends " + xx.interfaces.map((base) => langiumPrefix + base.name).join(", ") + " "
                    } else {
                        extendsClause += ", " + xx.interfaces.map((base) => langiumPrefix + base.name).join(", ") + " "
                    }
                }
                result += `interface ${langiumPrefix}${xx.name} ${extendsClause}{
    ${this.makeLangiumProperties(xx)}
}\n`
            } else if (xx instanceof FreMetaUnitDescription) {
                let extendsClause: string = ""
                if (xx.interfaces.length > 0) {
                    extendsClause = "extends " + xx.interfaces.map((base) => langiumPrefix + base.name).join(", ")
                }
                result += `interface ${langiumPrefix}${xx.name} ${extendsClause} {
    ${this.makeLangiumProperties(xx)}
}\n`
            } else {
                // classifier is a model
                result += `interface ${langiumPrefix}${xx.name} {
    ${this.makeLangiumProperties(xx)}
}\n`
            }
        }
        return result
    }

    private makeLangiumProperties(clas: FreMetaClassifier): string {
        return clas.primProperties.map((prop) => this.makeLangiumPropDecl(prop)).join("\n\t")
    }

    private makeLangiumPropDecl(prop: FreMetaProperty): string {
        if (prop.type instanceof FreMetaLimitedConcept) {
            return `${prop.name}${prop.isOptional ? `?` : ``} : ${this.makeLangiumPropType(prop)}${prop.isList ? `[]` : ``}`
        } else {
            return `${prop.name}${prop.isOptional ? `?` : ``} : ${!prop.isPart ? `@` : ``}${this.makeLangiumPropType(prop)}${prop.isList ? `[]` : ``}`
        }
    }
    private makeLangiumPropType(prop: FreMetaProperty): string {
        const propType = prop.type
        switch (propType) {
            case FreMetaPrimitiveType.string: {
                return "string"
            }
            case FreMetaPrimitiveType.identifier: {
                return "string"
            }
            case FreMetaPrimitiveType.number: {
                return "number"
            }
            case FreMetaPrimitiveType.boolean: {
                return "boolean"
            }
            default:
                return langiumPrefix + prop.type.name
        }
    }
}
