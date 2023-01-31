import { FreMetaScoper } from "../../languagedef/metalanguage/FreLangScoper";
import { FreClassifier, FreLangElement } from "../../languagedef/metalanguage";
import { PitCreateExp, PitPropertyCallExp, PitVarCallExp, PitWhereExp } from "../metalanguage/expressions";
import { PitProperty, PitTypeConcept, PiTyperDef, PiTyperElement } from "../metalanguage";
import { FreDefinitionElement, Names } from "../../utils";

/**
 * This class makes sure that references to parts of the typer definition can be found.
 * It is called by PiLangScoper, when it is added to its 'extraScopers'. The latter is
 * done by the typer checker.
 */
export class PitScoper implements FreMetaScoper {
    definition: PiTyperDef;

    constructor(definition: PiTyperDef) {
        this.definition = definition;
    }

    getFromVisibleElements(owner: FreDefinitionElement, name: string, typeName: string): FreLangElement {
        let result: FreLangElement;
        // if (name === "base2" ) {
        //     console.log("NEW SCOPER CALLED " + name + ": " + typeName + ", owner type: " + owner?.constructor.name);
        // }
        if (owner instanceof PitProperty || owner instanceof PiTyperElement ) { // PitProperty does not inherit from PiTyperElement!!
            if (typeName === "FreProperty") {
                let nameSpace: FreClassifier;
                if (owner instanceof PitCreateExp) {
                    nameSpace = owner.type;
                } else if (owner instanceof PitPropertyCallExp) {
                    nameSpace = owner.source.returnType;
                }
                result = nameSpace?.allProperties().find(prop => prop.name === name);
            } else if (typeName === "PitVarDecl") {
                if (owner instanceof PitVarCallExp) {
                    // find the only place in the typer definition where a variable can be declared: a PitWhereExp
                    const whereExp: PitWhereExp = this.findSurroudingWhereExp(owner);
                    if (whereExp?.variable.name === name) {
                        result = whereExp.variable;
                    }
                }
            } else if (typeName === "PitTypeConcept" || typeName === "FreClassifier") {
                if (name === Names.FreType || name === "FreonType") {
                    result = PiTyperDef.freonType;
                } else { // search the typeConcepts only, 'normal' classifiers will have been found already by FreLangScoper
                    result = this.definition.typeConcepts.find(con => con.name === name);
                }
            }
        }
        return result;
    }

    private findSurroudingWhereExp(owner: PiTyperElement): PitWhereExp {
        if (owner instanceof PitWhereExp) {
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
