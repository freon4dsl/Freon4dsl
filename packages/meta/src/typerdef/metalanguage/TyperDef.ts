import { FreTyperElement } from "./FreTyperElement";
import { FreClassifier, FreConcept, MetaElementReference, FreLanguage, FreProperty } from "../../languagedef/metalanguage";
import { FretTypeConcept } from "./FretTypeConcept";
import { FretClassifierSpec } from "./FretClassifierSpec";
import { FretAnyTypeSpec } from "./FretAnyTypeSpec";
import { CommonSuperTypeUtil } from "../../languagedef/checking/common-super/CommonSuperTypeUtil";
import { FretProperty } from "./FretProperty";
import { Names } from "../../utils";

export class TyperDef extends FreTyperElement {
    language: FreLanguage;
    static freonType: FreClassifier = this.makeFreType();

    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<TyperDef>): TyperDef {
        const result = new TyperDef();
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

    typeConcepts: FretTypeConcept[] = []; // implementation of part 'typeConcepts'
    anyTypeSpec: FretAnyTypeSpec; // implementation of part 'anyTypeSpec'
    classifierSpecs: FretClassifierSpec[] = []; // implementation of part 'classifierSpecs'
    __types: MetaElementReference<FreClassifier>[] = []; // implementation of reference 'types'
    __conceptsWithType: MetaElementReference<FreClassifier>[] = []; // implementation of reference 'conceptsWithType'
    // properties: FretProperty[] = [];
    private __typeRoot: FreClassifier;
    private typeRootHasBeenCalculated: boolean = false;
    readonly $typename: string = "TyperDef"; // holds the metatype in the form of a string

    get types(): FreClassifier[] {
        const result: FreClassifier[] = [];
        for (const ref of this.__types) {
            if (!!ref.referred) {
                result.push(ref.referred);
            }
        }
        return result;
    }

    set types(newTypes: FreClassifier[]) {
        this.__types = [];
        newTypes.forEach(t => {
            const xx = MetaElementReference.create<FreClassifier>(t, "FreClassifier");
            xx.owner = this.language;
            this.__types.push(xx);
        });
    }

    get conceptsWithType(): FreClassifier[] {
        const result: FreClassifier[] = [];
        for (const ref of this.__conceptsWithType) {
            if (!!ref.referred) {
                result.push(ref.referred);
            }
        }
        return result;
    }

    set conceptsWithType(newTypes: FreClassifier[]) {
        this.__conceptsWithType = [];
        newTypes.forEach(t => {
            const xx = MetaElementReference.create<FreClassifier>(t, "FreClassifier");
            xx.owner = this.language;
            this.__conceptsWithType.push(xx);
        });
    }
    typeRoot(): FreClassifier {
        if (!this.typeRootHasBeenCalculated) {
            // get the common super type of all types, if possible
            const list = CommonSuperTypeUtil.commonSuperType(this.types);
            this.__typeRoot = list.length > 0 ? list[0] : null;
            this.typeRootHasBeenCalculated = true;
        }
        return this.__typeRoot;
    }

    toFreString(): string{
        return `typer
istype { ${this.__types.map(t => t.name).join(", ")} }
${this.typeConcepts.map(con => con.toFreString()).join("\n")}
hastype { ${this.__conceptsWithType.map(t => t.name).join(", ")} }
${this.anyTypeSpec?.toFreString()}
${this.classifierSpecs.map(con => con.toFreString()).join("\n")}`;
    }

    private static makeFreType(): FretTypeConcept {
        const result: FretTypeConcept = new FretTypeConcept();
        result.name = Names.FreType;
        // internal: FreElement
        const prop: FreProperty = new FreProperty();
        prop.name = "internal";
        prop.typeReference = MetaElementReference.create<FreClassifier>("FreNode", "FreClassifier");
        prop.typeReference.owner = prop;
        result.properties.push(prop);
        return result;
    }
}
