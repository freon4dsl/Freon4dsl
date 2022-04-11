import { PiTyperElement } from "./PiTyperElement";
import { PiClassifier, PiConcept, PiElementReference, PiLanguage, PiProperty } from "../../languagedef/metalanguage";
import { PitTypeConcept } from "./PitTypeConcept";
import { PitClassifierSpec } from "./PitClassifierSpec";
import { PitAnyTypeSpec } from "./PitAnyTypeSpec";
import { CommonSuperTypeUtil } from "../../utils/common-super/CommonSuperTypeUtil";
import { PitProperty } from "./PitProperty";

export class PiTyperDef extends PiTyperElement {
    language: PiLanguage;
    static piType: PiClassifier = this.makePiType();

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
        return result;
    }

    typeConcepts: PitTypeConcept[] = []; // implementation of part 'typeConcepts'
    anyTypeSpec: PitAnyTypeSpec; // implementation of part 'anyTypeSpec'
    classifierSpecs: PitClassifierSpec[] = []; // implementation of part 'classifierSpecs'
    __types: PiElementReference<PiClassifier>[] = []; // implementation of reference 'types'
    __conceptsWithType: PiElementReference<PiClassifier>[] = []; // implementation of reference 'conceptsWithType'
    // properties: PitProperty[] = [];
    private __typeRoot: PiClassifier;
    private typeRootHasBeenCalculated: boolean = false;
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
    typeRoot(): PiClassifier {
        if (this.typeRootHasBeenCalculated) {
            return this.__typeRoot;
        } else { // get the common super type of all types, if possible
            const list = CommonSuperTypeUtil.commonSuperType(this.types);
            this.__typeRoot = list.length > 0 ? list[0] : null;
            this.typeRootHasBeenCalculated = true;
        }
        return null;
    }

    toPiString(): string{
        return `typer
istype { ${this.__types.map(t => t.name).join(", ")} }
${this.typeConcepts.map(con => con.toPiString()).join("\n")}
hastype { ${this.__conceptsWithType.map(t => t.name).join(", ")} }
${this.anyTypeSpec?.toPiString()}
${this.classifierSpecs.map(con => con.toPiString()).join("\n")}`;
    }

    private static makePiType(): PiConcept {
        const result: PiConcept = new PiConcept();
        result.name = "PiType";
        // internal: PiElement
        const prop: PiProperty = new PiProperty();
        prop.name = "internal";
        prop.typeReference = PiElementReference.create<PiClassifier>("PiElement", "PiClassifier");
        result.properties.push(prop);
        return result;
    }
}
