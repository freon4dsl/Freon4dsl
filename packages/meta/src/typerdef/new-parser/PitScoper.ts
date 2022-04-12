import { PiMetaScoper } from "../../languagedef/metalanguage/PiLangScoper";
import { PiClassifier, PiLangElement } from "../../languagedef/metalanguage";
import { PitBinaryExp, PitCreateExp, PitPropertyCallExp, PitVarCallExp, PitWhereExp } from "../new-metalanguage/expressions";
import { PitProperty, PitTypeConcept, PiTyperDef, PiTyperElement } from "../new-metalanguage";
import { PiDefinitionElement } from "../../utils";

export class PitScoper implements PiMetaScoper {
    definition: PiTyperDef;

    constructor(definition: PiTyperDef) {
        this.definition = definition;
    }

    getFromVisibleElements(owner: PiDefinitionElement, name: string, typeName: string): PiLangElement {
        let result: PiLangElement;
        // if (name === "baseType") {
        //     console.log("NEW SCOPER CALLED " + name + ": " + typeName + ", owner type: " + owner?.constructor.name);
        // }
        if (owner instanceof PitProperty || owner instanceof PiTyperElement ) { // PitProperty does not inherited from PiTyperElement!!
            if (typeName === "PiProperty") {
                let nameSpace: PiClassifier;
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
            } else if (typeName === "PitTypeConcept" || typeName === "PiClassifier") {
                if (name === "PiType" || name === "FreonType") {
                    result = PiTyperDef.freonType;
                } else { // search the typeConcepts only, 'normal' classifiers will have been found already by PiLangScoper
                    result = this.definition.typeConcepts.find(con => con.name === name);
                }
            }
        }
        // if (name === "baseType") {
        //     console.log("NEW SCOPER RESULT: " + result?.name + ": " + result?.constructor.name);
        // }
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
