import { FreMetaScoper } from "../../languagedef/metalanguage/FreLangScoper";
import { FreClassifier, FreLangElement } from "../../languagedef/metalanguage";
import { FretCreateExp, FretPropertyCallExp, FretVarCallExp, FretWhereExp } from "../metalanguage/expressions";
import { FretProperty, FretTypeConcept, TyperDef, FreTyperElement } from "../metalanguage";
import { FreDefinitionElement, Names } from "../../utils";

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

    getFromVisibleElements(owner: FreDefinitionElement, name: string, typeName: string): FreLangElement {
        let result: FreLangElement;
        // if (name === "base2" ) {
        //     console.log("NEW SCOPER CALLED " + name + ": " + typeName + ", owner type: " + owner?.constructor.name);
        // }
        if (owner instanceof FretProperty || owner instanceof FreTyperElement ) { // FretProperty does not inherit from FretTyperElement!!
            if (typeName === "FreProperty") {
                let nameSpace: FreClassifier;
                if (owner instanceof FretCreateExp) {
                    nameSpace = owner.type;
                } else if (owner instanceof FretPropertyCallExp) {
                    nameSpace = owner.source.returnType;
                }
                result = nameSpace?.allProperties().find(prop => prop.name === name);
            } else if (typeName === "FretVarDecl") {
                if (owner instanceof FretVarCallExp) {
                    // find the only place in the typer definition where a variable can be declared: a FretWhereExp
                    const whereExp: FretWhereExp = this.findSurroudingWhereExp(owner);
                    if (whereExp?.variable.name === name) {
                        result = whereExp.variable;
                    }
                }
            } else if (typeName === "FretTypeConcept" || typeName === "FreClassifier") {
                if (name === Names.FreType || name === "FreonType") {
                    result = TyperDef.freonType;
                } else { // search the typeConcepts only, 'normal' classifiers will have been found already by FreLangScoper
                    result = this.definition.typeConcepts.find(con => con.name === name);
                }
            }
        }
        return result;
    }

    private findSurroudingWhereExp(owner: FreTyperElement): FretWhereExp {
        if (owner instanceof FretWhereExp) {
            return owner;
        } else {
            if (owner.owner) {
                return this.findSurroudingWhereExp(owner.owner);
            } else {
                return null;
            }
        }
    }
}
