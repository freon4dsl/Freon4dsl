import { PiDefinitionElement } from "../../utils";
import { PiClassifier, PiElementReference, PiLanguage } from "../../languagedef/metalanguage";
import { PitTypeConcept } from "./PitTypeConcept";
import { PitClassifierSpec } from "./PitClassifierSpec";
import { PitAnyTypeSpec } from "./PitAnyTypeSpec";

export class PiTyperDef extends PiDefinitionElement {
    language: PiLanguage;
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PiTyperDef>): PiTyperDef {
        const result = new PiTyperDef();
        if (!!data.location) {
            result.location = data.location;
        }
        if (!!data.typeConcepts) {
            data.typeConcepts.forEach(x => result.typeConcepts.push(x));
        }
        if (!!data.anyTypeSpec) {
            result.anyTypeSpec = data.anyTypeSpec;
        }
        if (!!data.classifierSpecs) {
            data.classifierSpecs.forEach(x => result.classifierSpecs.push(x));
        }
        if (!!data.types) {
            data.types.forEach(x => result.types.push(x));
        }
        if (!!data.conceptsWithType) {
            data.conceptsWithType.forEach(x => result.conceptsWithType.push(x));
        }
        if (!!data.__types) {
            data.__types.forEach(x => result.__types.push(x));
        }
        if (!!data.__conceptsWithType) {
            data.__conceptsWithType.forEach(x => result.__conceptsWithType.push(x));
        }
        if (!!data.typeRoot) {
            result.typeRoot = data.typeRoot;
        }
        if (!!data.__typeRoot) {
            result.__typeRoot = data.__typeRoot;
        }
        return result;
    }

    typeConcepts: PitTypeConcept[] = []; // implementation of part 'typeConcepts'
    anyTypeSpec: PitAnyTypeSpec; // implementation of part 'anyTypeSpec'
    classifierSpecs: PitClassifierSpec[] = []; // implementation of part 'classifierSpecs'
    __types: PiElementReference<PiClassifier>[] = []; // implementation of reference 'types'
    __conceptsWithType: PiElementReference<PiClassifier>[] = []; // implementation of reference 'conceptsWithType'
    __typeRoot: PiElementReference<PiClassifier>; // implementation of reference 'typeroot'
    readonly $typename: string = "PiTyperDef"; // holds the metatype in the form of a string

    get types(): PiClassifier[] {
        const result: PiClassifier[] = [];
        for (const ref of this.__types) {
            if (!!ref.referred) {
                result.push(ref.referred);
            }
        }
        return result;
    }

    set types(newTypes: PiClassifier[]) {
        this.__types = [];
        newTypes.forEach(t => {
            const xx = PiElementReference.create<PiClassifier>(t, "PiClassifier");
            xx.owner = this.language;
            this.__types.push(xx);
        });
    }

    get conceptsWithType(): PiClassifier[] {
        const result: PiClassifier[] = [];
        for (const ref of this.__conceptsWithType) {
            if (!!ref.referred) {
                result.push(ref.referred);
            }
        }
        return result;
    }

    set conceptsWithType(newTypes: PiClassifier[]) {
        this.__conceptsWithType = [];
        newTypes.forEach(t => {
            const xx = PiElementReference.create<PiClassifier>(t, "PiClassifier");
            xx.owner = this.language;
            this.__conceptsWithType.push(xx);
        });
    }
    get typeRoot(): PiClassifier {
        if (!!this.__typeRoot && !!this.__typeRoot.referred) {
            return this.__typeRoot.referred;
        }
        return null;
    }
    set typeRoot(cls: PiClassifier) {
        if (!!cls) {
            this.__typeRoot = PiElementReference.create<PiClassifier>(cls, "PiClassifier");
            this.__typeRoot.owner = this.language;
        }
    }
    toPiString(): string{
        return `typer
istype { ${this.__types.map(t => t.name).join(", ")} }
${this.typeConcepts.map(con => con.toPiString()).join("\n")}
hastype { ${this.__conceptsWithType.map(t => t.name).join(", ")} }
${this.anyTypeSpec?.toPiString()}
${this.classifierSpecs.map(con => con.toPiString()).join("\n")}`;
    }
}
