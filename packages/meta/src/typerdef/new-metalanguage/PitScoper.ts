import { Checker, PiDefinitionElement } from "../../utils";
import { PiClassifier, PiLangElement } from "../../languagedef/metalanguage";
import { PiTyperDef } from "./PiTyperDef";
import { PitWhereExp } from "./expressions";

export class PitScoper {
    typer: PiTyperDef;

    public getFromVisibleElements(owner: PiDefinitionElement, name: string, typeName: string): PiLangElement {
        let result: PiLangElement;
        if (typeName === "PitProperty" ) {
            if (owner instanceof PiClassifier) {
                result = owner.allProperties().find(prop => prop.name === name);
            }
        } else if (typeName === "PitVarDecl" ) {
            if (!!this.typer) {
                console.log("searching for a PitVarDecl: " + name);
                if (owner instanceof PitWhereExp && owner.variable.name === name) {
                    result = owner.variable;
                }
            }
        } else if (typeName === "PitTypeConcept" ) {
            if (!!this.typer) {
                console.log("searching for a PitTypeConcept: " + name);
                result = this.typer.typeConcepts.find(con => con.name === name);
            }
        } else {
            let ownerDescriptor: string;
            if (owner instanceof PiLangElement) {
                ownerDescriptor = owner.name;
            } else {
                ownerDescriptor = Checker.location(owner);
            }
            console.error("NO calculation found for " + name + ", owner: " + ownerDescriptor + ", type:" + typeName);
        }
        return result;
    }
}
