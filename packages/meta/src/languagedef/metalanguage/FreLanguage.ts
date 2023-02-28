import { MetaElementReference } from "./internal";
import { FreDefinitionElement } from "../../utils/FreDefinitionElement";

// root of the inheritance structure of all elements in a language definition
export abstract class FreLangElement extends FreDefinitionElement {
    name: string;
}

export class FreLanguage extends FreLangElement {
    concepts: FreConcept[] = [];
    interfaces: FreInterface[] = [];
    modelConcept: FreModelDescription;
    units: FreUnitDescription[] = [];

    constructor() {
        super();
    }

    classifiers(): FreClassifier[] {
        const result: FreClassifier[] = this.concepts;
        return result.concat(this.interfaces).concat(this.units);
    }

    conceptsAndInterfaces(): FreClassifier[] {
        const result: FreClassifier[] = this.concepts;
        return result.concat(this.interfaces);
    }

    findConcept(name: string): FreConcept {
        return this.concepts.find(con => con.name === name);
    }

    findInterface(name: string): FreInterface {
        return this.interfaces.find(con => con.name === name);
    }

    findClassifier(name: string): FreClassifier {
        let result: FreClassifier;
        result = this.findConcept(name);
        if (result === undefined) {
            result = this.findInterface(name);
        }
        if (result === undefined) {
            result = this.findUnitDescription(name);
        }
        if (result === undefined) {
            result = this.findBasicType(name);
        }
        return result;
    }

    findBasicType(name: string): FreClassifier {
        return FrePrimitiveType.find(name);
    }

    findUnitDescription(name: string): FreUnitDescription {
        return this.units.find(u => u.name === name);
    }
}

export abstract class FreClassifier extends FreLangElement {
    private static __ANY: FreClassifier = null;

    static get ANY(): FreClassifier {
        if (FreClassifier.__ANY === null || FreClassifier.__ANY === undefined) {
            FreClassifier.__ANY = new FreConcept();
            FreClassifier.__ANY.name = "ANY";
        }
        return this.__ANY;
    }

    id?: string;
    language: FreLanguage;
    isPublic: boolean;
    properties: FreProperty[] = [];
    // TODO remove this attribute and make it a function on 'properties'
    primProperties: FrePrimitiveProperty[] = [];
    // get primProperties(): FrePrimitiveProperty[] {
    //     return this.properties.filter(prop => prop instanceof FrePrimitiveProperty) as FrePrimitiveProperty[];
    //     // of
    //     return this.properties.filter(prop => prop.type instanceof FrePrimitiveType) as FrePrimitiveProperty[];
    // }

    parts(): FreConceptProperty[] {
        return this.properties.filter(p => p instanceof FreConceptProperty && p.isPart) as FreConceptProperty[];
    }

    references(): FreConceptProperty[] {
        return this.properties.filter(p => p instanceof FreConceptProperty && !p.isPart) as FreConceptProperty[];
    }

    allPrimProperties(): FrePrimitiveProperty[] {
        const result: FrePrimitiveProperty[] = [];
        result.push(...this.primProperties);
        return result;
    }

    allParts(): FreConceptProperty[] {
        return this.parts();
    }

    allReferences(): FreConceptProperty[] {
        return this.references();
    }

    allProperties(): FreProperty[] {
        const result: FreProperty[] = [];
        result.push(...this.allPrimProperties());
        result.push(...this.allParts());
        result.push(...this.allReferences());
        return result;
    }

    nameProperty(): FrePrimitiveProperty {
        return this.allPrimProperties().find(p => p.name === "name" && p.type === FrePrimitiveType.identifier);
    }
}

export class FreModelDescription extends FreClassifier {
    isPublic: boolean = true;

    unitTypes(): FreUnitDescription[] {
        let result: FreUnitDescription[] = [];
        // all parts of a model are units
        for (const intf of this.parts()) {
            result = result.concat(intf.type as FreUnitDescription);
        }
        return result;
    }
}

export class FreUnitDescription extends FreClassifier {
    fileExtension: string = "";
    isPublic: boolean = true;
}

export class FreInterface extends FreClassifier {
    base: MetaElementReference<FreInterface>[] = [];

    allPrimProperties(): FrePrimitiveProperty[] {
        let result: FrePrimitiveProperty[] = []; // return a new array
        result.push(...this.primProperties);
        for (const intf of this.base) {
            result = result.concat(intf.referred.allPrimProperties());
        }
        return result;
    }

    allParts(): FreConceptProperty[] {
        let result: FreConceptProperty[] = this.parts();
        for (const intf of this.base) {
            result = result.concat(intf.referred.allParts());
        }
        return result;
    }

    allReferences(): FreConceptProperty[] {
        let result: FreConceptProperty[] = this.references();
        for (const intf of this.base) {
            result = result.concat(intf.referred.allReferences());
        }
        return result;
    }

    allProperties(): FreProperty[] {
        let result: FreProperty[] = [];
        result = result.concat(this.allPrimProperties()).concat(this.allParts()).concat(this.allReferences());
        return result;
    }

    allBaseInterfaces(): FreInterface[] {
        let result: FreInterface[] = [];
        for (const base of this.base) {
            const realbase = base.referred;
            if (!!realbase) {
                result.push(realbase);
                result = result.concat(realbase.allBaseInterfaces());
            }
        }
        return result;
    }

    /**
     * returns all subinterfaces, but not their subinterfaces
     */
    allSubInterfacesDirect(): FreInterface[] {
        return this.language.interfaces.filter(c => c.base?.find(b => b.referred === this) !== undefined);
    }

    /**
     * returns all subinterfaces and subinterfaces of the subinterfaces
     */
    allSubInterfacesRecursive(): FreInterface[] {
        let result = this.allSubInterfacesDirect();
        const tmp = this.allSubInterfacesDirect();
        tmp.forEach(concept => result = result.concat(concept.allSubInterfacesRecursive()));
        return result;
    }

}

export class FreConcept extends FreClassifier {
    isAbstract: boolean = false;
    base: MetaElementReference<FreConcept>;
    interfaces: MetaElementReference<FreInterface>[] = []; // the interfaces that this concept implements

    allPrimProperties(): FrePrimitiveProperty[] {
        const result: FrePrimitiveProperty[] = this.implementedPrimProperties();
        if (!!this.base && !!this.base.referred) {
            this.base.referred.allPrimProperties().forEach(p => {
                // hide overwritten property
                if (!result.some(previous => previous.name === p.name && previous.implementedInBase)) {
                    result.push(p);
                }
            });
        }
        return result;
    }

    allParts(): FreConceptProperty[] {
        const result: FreConceptProperty[] = this.implementedParts();
        if (!!this.base && !!this.base.referred) {
            this.base.referred.allParts().forEach(p => {
                // hide overwritten property
                if (!result.some(previous => previous.name === p.name && previous.implementedInBase)) {
                    result.push(p);
                }
            });
        }
        return result;
    }

    allReferences(): FreConceptProperty[] {
        const result: FreConceptProperty[] = this.implementedReferences();
        if (!!this.base && !!this.base.referred) {
            this.base.referred.allReferences().forEach(p => {
                // hide overwritten property
                if (!result.some(previous => previous.name === p.name && previous.implementedInBase)) {
                    result.push(p);
                }
            });
        }
        return result;
    }

    allProperties(): FreProperty[] {
        let result: FreProperty[] = [];
        result = result.concat(this.allPrimProperties()).concat(this.allParts()).concat(this.allReferences());
        return result;
    }

    /**
     * Returns a list of properties that are either (1) defined in this concept or (2) in one of the interfaces
     * that is implemented by this concept. Excluded are properties that are defined in an interface but are already
     * included in one of the base concepts.
     */
    implementedPrimProperties(): FrePrimitiveProperty[] {
        let result: FrePrimitiveProperty[] = []; // return a new array!
        result.push(...this.primProperties);
        for (const intf of this.interfaces) {
            for (const intfProp of intf.referred.allPrimProperties()) {
                let allreadyIncluded = false;
                // if the prop from the interface is present in this concept, do not include
                allreadyIncluded = this.primProperties.some(p => p.name === intfProp.name );
                // if the prop from the interface is present in the base of this concept (resursive), do not include
                if (!allreadyIncluded && !!this.base && !!this.base.referred) {
                    allreadyIncluded = this.base.referred.allPrimProperties().some(p => p.name === intfProp.name);
                }
                // if the prop from the interface is present in another implemented interface, do not include
                if (!allreadyIncluded) {
                    allreadyIncluded = result.some(p => p.name === intfProp.name );
                }
                if (!allreadyIncluded) {
                    result = result.concat(intfProp);
                }
            }
        }
        return result;
    }

    implementedParts(): FreConceptProperty[] {
        let result: FreConceptProperty[] = this.parts();
        for (const intf of this.interfaces) {
            for (const intfProp of intf.referred.allParts()) {
                let allreadyIncluded = false;
                // if the prop from the interface is present in this concept, do not include
                allreadyIncluded = this.parts().some(p => p.name === intfProp.name);
                // if the prop from the interface is present in the base of this concept, do not include
                if (!allreadyIncluded && !!this.base && !!this.base.referred) {
                    allreadyIncluded = this.base.referred.allParts().some(p => p.name === intfProp.name);
                }
                // if the prop from the interface is present in another implemented interface, do not include
                if (!allreadyIncluded) {
                    allreadyIncluded = result.some(p => p.name === intfProp.name );
                }
                if (!allreadyIncluded) {
                    result = result.concat(intfProp);
                }
            }
        }
        return result;
    }

    implementedReferences(): FreConceptProperty[] {
        let result: FreConceptProperty[] = this.references();
        for (const intf of this.interfaces) {
            for (const intfProp of intf.referred.allReferences()) {
                let allreadyIncluded = false;
                // if the prop from the interface is present in this concept, do not include
                allreadyIncluded = this.references().some(p => p.name === intfProp.name);
                // if the prop from the interface is present in the base of this concept, do not include
                if (!allreadyIncluded && !!this.base && !!this.base.referred) {
                    allreadyIncluded = this.base.referred.allReferences().some(p => p.name === intfProp.name);
                }
                // if the prop from the interface is present in another implemented interface, do not include
                if (!allreadyIncluded) {
                    allreadyIncluded = result.some(p => p.name === intfProp.name );
                }
                if (!allreadyIncluded) {
                    result = result.concat(intfProp);
                }
            }
        }
        return result;
    }

    implementedProperties(): FreProperty[] {
        let result: FreProperty[] = [];
        result = result.concat(this.implementedPrimProperties()).concat(this.implementedParts()).concat(this.implementedReferences());
        return result;
    }

    allInterfaces(): FreInterface[] {
        let result: FreInterface[] = [];
        for (const intf of this.interfaces) {
            const realintf = intf.referred;
            if (!!realintf) {
                result.push(realintf);
                result = result.concat(realintf.allBaseInterfaces());
            }
        }
        return result;
    }

    /**
     * returns all subconcepts, but not their subconcepts
     */
    allSubConceptsDirect(): FreConcept[] {
        return this.language.concepts.filter(c => c.base?.referred === this);
    }

    /**
     * returns all subconcepts and subconcepts of the subconcepts
     */
    allSubConceptsRecursive(): FreConcept[] {
        let result = this.allSubConceptsDirect();
        const tmp = this.allSubConceptsDirect();
        tmp.forEach(concept => result = result.concat(concept.allSubConceptsRecursive()));
        return result;
    }

}

export class FreExpressionConcept extends FreConcept {
    _isPlaceHolder: boolean;
}

export class FreBinaryExpressionConcept extends FreExpressionConcept {
    // left: FreExpressionConcept;
    // right: FreExpressionConcept;
    priority: number;

    getPriority(): number {
        const p = this.priority;
        return (!!p ? p : -1);
    }
}

export class FreLimitedConcept extends FreConcept {
    instances: FreInstance[] = [];

    findInstance(name: string): FreInstance {
        return this.instances.find(inst => inst.name === name);
    }

    allInstances(): FreInstance[] {
        const result: FreInstance[] = [];
        result.push(...this.instances);
        if (!!this.base && this.base.referred instanceof FreLimitedConcept) {
            result.push(...this.base.referred.allInstances());
        }
        return result;
    }
}

export class FreProperty extends FreLangElement {
    id?: string;
    isPublic: boolean;
    isOptional: boolean;
    isList: boolean;
    isPart: boolean; // if false then it is a reference property
    implementedInBase: boolean = false;
    private $type: MetaElementReference<FreClassifier>;
    owningClassifier: FreClassifier;

    get isPrimitive(): boolean {
        return this.type instanceof FrePrimitiveType;
    }
    get type(): FreClassifier {
        return this.$type?.referred;
    }
    set type(t: FreClassifier) {
        this.$type = MetaElementReference.create<FreClassifier>(t, "FreClassifier");
        this.$type.owner = this;
    }
    get typeReference(): MetaElementReference<FreClassifier> { // only used by FreLanguageChecker and FreTyperChecker
        return this.$type;
    }
    set typeReference(t: MetaElementReference<FreClassifier>) { // only used by FreLanguageChecker and FreTyperChecker
        this.$type = t;
        this.$type.owner = this;
    }
    toFreString(): string {
        return this.name + ": " + this.$type.name;
    }
}

export class FreConceptProperty extends FreProperty {
    hasLimitedType: boolean; // set in checker
}

export class FrePrimitiveProperty extends FreProperty {
    isStatic: boolean;
    initialValueList: FrePrimitiveValue[] = [];

    get isPrimitive(): boolean {
        return true;
    }

    get initialValue(): FrePrimitiveValue {
        return this.initialValueList[0];
    }

    set initialValue(value: FrePrimitiveValue) {
        this.initialValueList[0] = value;
    }
}

export class FreInstance extends FreLangElement {
    concept: MetaElementReference<FreConcept>; // should be a limited concept
    // Note that these properties may be undefined, when there is no definition in the .ast file
    props: FreInstanceProperty[] = [];

    nameProperty(): FreInstanceProperty {
        return this.props.find(p => p.name === "name");
    }
}

export class FreInstanceProperty extends FreLangElement {
    owningInstance: MetaElementReference<FreInstance>;
    property: MetaElementReference<FreProperty>;
    valueList: FrePrimitiveValue[] = [];

    get value(): FrePrimitiveValue {
        return this.valueList[0];
    }

    set value(newV) {
        this.valueList[0] = newV;
    }
}

// the following two classes are only used in the typer and validator definitions
export class FreFunction extends FreLangElement {
    language: FreLanguage;
    formalparams: FreParameter[] = [];
    returnType: MetaElementReference<FreConcept>;
}

export class FreParameter extends FreLangElement {
    type: MetaElementReference<FreConcept>;
}

// the basic types in the Fre-languages
export type FrePrimitiveValue = string | boolean | number ;

export class FrePrimitiveType extends FreConcept {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<FrePrimitiveType>): FrePrimitiveType {
        const result = new FrePrimitiveType();
        if (!!data.name) {
            result.name = data.name;
        }
        return result;
    }

    static string: FrePrimitiveType = FrePrimitiveType.create({ name: "string" });
    static number: FrePrimitiveType = FrePrimitiveType.create({ name: "number" });
    static boolean: FrePrimitiveType = FrePrimitiveType.create({ name: "boolean" });
    static identifier: FrePrimitiveType = FrePrimitiveType.create({ name: "identifier" });
    static $freAny: FrePrimitiveType; // default predefined instance

    static find(name: string) {
        switch (name) {
            case "string" : return this.string;
            case "boolean" : return this.boolean;
            case "identifier" : return this.identifier;
            case "number" : return this.number;
        }
        return this.$freAny;
    }

    allSubConceptsRecursive(): FreConcept[] {
        return [];
    }
    allSubConceptsDirect(): FreConcept[] {
        return [];
    }
}

export function isBinaryExpression(elem: FreLangElement): elem is FreBinaryExpressionConcept {
    return elem instanceof FreBinaryExpressionConcept;
}

export function isExpression(elem: FreLangElement): elem is FreExpressionConcept {
    return elem instanceof FreExpressionConcept;
}

export function isLimited(elem: FreLangElement): elem is FreLimitedConcept {
    return elem instanceof FreLimitedConcept;
}
