import { FreTyperElement } from "./FreTyperElement";
import { FreMetaClassifier, MetaElementReference, FreMetaLanguage, FreMetaProperty } from "../../languagedef/metalanguage";
import { FretTypeConcept } from "./FretTypeConcept";
import { FretClassifierSpec } from "./FretClassifierSpec";
import { FretAnyTypeSpec } from "./FretAnyTypeSpec";
import { CommonSuperTypeUtil } from "../../languagedef/checking/common-super/CommonSuperTypeUtil";
import { Names } from "../../utils";

export class TyperDef extends FreTyperElement {
    static freonType: FreMetaClassifier = this.makeFreType();

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
        if (!!data.$types) {
            data.$types.forEach(x => result.$types.push(x));
        }
        if (!!data.$conceptsWithType) {
            data.$conceptsWithType.forEach(x => result.$conceptsWithType.push(x));
        }
        return result;
    }

    private static makeFreType(): FretTypeConcept {
        const result: FretTypeConcept = new FretTypeConcept();
        result.name = Names.FreType;
        // internal: FreElement
        const prop: FreMetaProperty = new FreMetaProperty();
        prop.name = "internal";
        prop.typeReference = MetaElementReference.create<FreMetaClassifier>("FreNode", "FreClassifier");
        prop.typeReference.owner = prop;
        result.properties.push(prop);
        return result;
    }
    language: FreMetaLanguage;

    typeConcepts: FretTypeConcept[] = []; // implementation of part 'typeConcepts'
    anyTypeSpec: FretAnyTypeSpec; // implementation of part 'anyTypeSpec'
    classifierSpecs: FretClassifierSpec[] = []; // implementation of part 'classifierSpecs'
    $types: MetaElementReference<FreMetaClassifier>[] = []; // implementation of reference 'types'
    $conceptsWithType: MetaElementReference<FreMetaClassifier>[] = []; // implementation of reference 'conceptsWithType'
    // properties: FretProperty[] = [];
    private $typeRoot: FreMetaClassifier | undefined;
    private typeRootHasBeenCalculated: boolean = false;
    readonly $typename: string = "TyperDef"; // holds the metatype in the form of a string

    get types(): FreMetaClassifier[] {
        const result: FreMetaClassifier[] = [];
        for (const ref of this.$types) {
            if (!!ref.referred) {
                result.push(ref.referred);
            }
        }
        return result;
    }

    set types(newTypes: FreMetaClassifier[]) {
        this.$types = [];
        newTypes.forEach(t => {
            const xx = MetaElementReference.create<FreMetaClassifier>(t, "FreClassifier");
            xx.owner = this.language;
            this.$types.push(xx);
        });
    }

    get conceptsWithType(): FreMetaClassifier[] {
        const result: FreMetaClassifier[] = [];
        for (const ref of this.$conceptsWithType) {
            if (!!ref.referred) {
                result.push(ref.referred);
            }
        }
        return result;
    }

    set conceptsWithType(newTypes: FreMetaClassifier[]) {
        this.$conceptsWithType = [];
        newTypes.forEach(t => {
            const xx = MetaElementReference.create<FreMetaClassifier>(t, "FreClassifier");
            xx.owner = this.language;
            this.$conceptsWithType.push(xx);
        });
    }
    typeRoot(): FreMetaClassifier | undefined {
        if (!this.typeRootHasBeenCalculated) {
            // get the common super type of all types, if possible
            const list = CommonSuperTypeUtil.commonSuperType(this.types);
            this.$typeRoot = list.length > 0 ? list[0] : undefined;
            this.typeRootHasBeenCalculated = true;
        }
        return this.$typeRoot;
    }

    toFreString(): string {
        return `typer
istype { ${this.$types.map(t => t.name).join(", ")} }
${this.typeConcepts.map(con => con.toFreString()).join("\n")}
hastype { ${this.$conceptsWithType.map(t => t.name).join(", ")} }
${this.anyTypeSpec?.toFreString()}
${this.classifierSpecs.map(con => con.toFreString()).join("\n")}`;
    }
}
