import { FreMetaScoper } from "../../languagedef/metalanguage/FreLangScoper.js";
import { FreMetaClassifier, FreMetaLangElement } from "../../languagedef/metalanguage/index.js";
import { FretCreateExp, FretPropertyCallExp, FretVarCallExp, FretWhereExp } from "../metalanguage/expressions/index.js";
import { FretProperty, TyperDef, FreTyperElement } from "../metalanguage/index.js";
import { FreMetaDefinitionElement, Names } from "../../utils/index.js";

/**
 * This class makes sure that references to parts of the typer definition can be found.
 * It is called by FreLangScoper, when it is added to its 'extraScopers'. The latter is
 * done by the typer checker.
 */
export class FretScoper implements FreMetaScoper {
    definition: TyperDef;

    constructor(definition: TyperDef) {
        this.definition = definition;
    }

    getFromVisibleElements(
        owner: FreMetaDefinitionElement,
        name: string,
        typeName: string,
    ): FreMetaLangElement | undefined {
        let result: FreMetaLangElement | undefined;
        // if (name === "base2" ) {
        //     console.log("NEW SCOPER CALLED " + name + ": " + typeName + ", owner type: " + owner?.constructor.name);
        // }
        if (owner instanceof FretProperty || owner instanceof FreTyperElement) {
            // FretProperty does not inherit from FretTyperElement!!
            if (typeName === "FreProperty") {
                let nameSpace: FreMetaClassifier | undefined;
                if (owner instanceof FretCreateExp) {
                    nameSpace = owner.type;
                } else if (owner instanceof FretPropertyCallExp) {
                    nameSpace = owner.source.returnType;
                }
                result = nameSpace?.allProperties().find((prop) => prop.name === name);
            } else if (typeName === "FretVarDecl") {
                if (owner instanceof FretVarCallExp) {
                    // find the only place in the typer definition where a variable can be declared: a FretWhereExp
                    const whereExp: FretWhereExp | undefined = this.findSurroudingWhereExp(owner);
                    if (whereExp?.variable.name === name) {
                        result = whereExp.variable;
                    }
                }
            } else if (typeName === "FretTypeConcept" || typeName === "FreClassifier") {
                if (name === Names.FreType || name === "FreonType") {
                    result = TyperDef.freonType;
                } else {
                    // search the typeConcepts only, 'normal' classifiers will have been found already by FreLangScoper
                    result = this.definition.typeConcepts.find((con) => con.name === name);
                }
            }
        }
        return result;
    }

    private findSurroudingWhereExp(owner: FreTyperElement): FretWhereExp | undefined {
        if (owner instanceof FretWhereExp) {
            return owner;
        } else {
            if (owner.owner) {
                return this.findSurroudingWhereExp(owner.owner);
            } else {
                return undefined;
            }
        }
    }
}
