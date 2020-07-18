import { PiElementReference } from "./PiElementReference";
import { ParseLocation } from "../../utils";

const primitiveTypeName = "PiPrimitiveType";

// root of the inheritance structure of all language elements
export abstract class PiLangElement {
    location: ParseLocation;
    name: string;
}

export class PiLanguageUnit extends PiLangElement {
    concepts: PiConcept[] = [];
    interfaces: PiInterface[] = [];
    predefInstances: PiInstance[] = [];
    rootConcept: PiConcept; // set by the checker

    constructor() {
        super();
        // this.addPredefinedElements();
    }

    get units(): PiConcept[] {
        return this.concepts.filter(con => con.isUnit === true);
    }
    conceptsAndInterfaces(): PiClassifier[] {
        const result: PiClassifier[] = this.concepts;
        return result.concat(this.interfaces);
    }

    findConcept(name: string): PiConcept {
        return this.concepts.find(con => con.name === name);
    }

    findInterface(name: string): PiInterface {
        return this.interfaces.find(con => con.name === name);
    }

    findClassifier(name: string): PiClassifier {
        let result : PiClassifier;
        result = this.findConcept(name);
        if (result === undefined) result = this.findInterface(name);
        return result;
    }

    findExpressionBase(): PiExpressionConcept {
        const result = this.concepts.find(c => {
            return c instanceof PiExpressionConcept && (!!c.base ? !(c.base.referred instanceof PiExpressionConcept) : true);
        });
        return result as PiExpressionConcept;
    }

    private addPredefinedElements() {
        // make the primitive types
        let primitiveTypeConcept = new PiLimitedConcept();
        primitiveTypeConcept.name = "PiPrimitiveType";
        primitiveTypeConcept.language = this;
        this.concepts.push(primitiveTypeConcept);
        let STRING = new PiInstance();
        STRING.name = "string";
        STRING.concept = PiElementReference.create<PiConcept>(primitiveTypeConcept, "PiConcept");
        STRING.concept.owner = STRING;
        this.predefInstances.push(STRING);
        let NUMBER = new PiInstance();
        NUMBER.name = "number";
        NUMBER.concept = PiElementReference.create<PiConcept>(primitiveTypeConcept, "PiConcept");
        NUMBER.concept.owner = NUMBER;
        this.predefInstances.push(NUMBER);
        let BOOLEAN = new PiInstance();
        BOOLEAN.name = "boolean";
        BOOLEAN.concept = PiElementReference.create<PiConcept>(primitiveTypeConcept, "PiConcept");
        BOOLEAN.concept.owner = BOOLEAN;
        this.predefInstances.push(BOOLEAN);
        // TODO make the predefined functions
    }
}

export abstract class PiClassifier extends PiLangElement {
    language: PiLanguageUnit;
    isPublic: boolean;
    properties: PiProperty[] = [];
    primProperties: PiPrimitiveProperty[] = [];

    parts(): PiConceptProperty[] {
        // return this.properties.filter(p => p instanceof PiConceptProperty && p.isPart);
        let result: PiConceptProperty[] = [];
        for (let prop of this.properties) {
            if (prop instanceof PiConceptProperty && prop.isPart) {
                result.push(prop);
            }
        }
        return result;
    }

    references(): PiConceptProperty[] {
        let result: PiConceptProperty[] = [];
        for (let prop of this.properties) {
            if (prop instanceof PiConceptProperty && !prop.isPart) {
                result.push(prop);
            }
        }
        return result;
    }

    allPrimProperties(): PiPrimitiveProperty[] {
        return this.primProperties;
    }

    allParts(): PiConceptProperty[] {
        return this.parts();
    }

    allReferences(): PiConceptProperty[] {
        return this.references();
    }

    allProperties(): PiProperty[] {
        let result : PiProperty[] = [];
        result = result.concat(this.allPrimProperties()).concat(this.allParts()).concat(this.allReferences());
        return result;
    }
}

export class PiInterface extends PiClassifier {
    base: PiElementReference<PiInterface>[] = [];

    allPrimProperties(): PiPrimitiveProperty[] {
        let result: PiPrimitiveProperty[] = this.primProperties;
        for (let intf of this.base) {
            result = result.concat(intf.referred.allPrimProperties());
        }
        return result;
    }

    allParts(): PiConceptProperty[] {
        let result: PiConceptProperty[] = this.parts();
        for (let intf of this.base) {
            result = result.concat(intf.referred.allParts());
        }
        return result;
    }

    allReferences(): PiConceptProperty[] {
        let result: PiConceptProperty[] = this.references();
        for (let intf of this.base) {
            result = result.concat(intf.referred.allReferences());
        }
        return result;
    }

    allProperties(): PiProperty[] {
        let result : PiProperty[] = [];
        result = result.concat(this.allPrimProperties()).concat(this.allParts()).concat(this.allReferences());
        return result;
    }

    allBaseInterfaces(): PiInterface[] {
        let result : PiInterface[] = [];
        for (let base of this.base) {
            let realbase = base.referred;
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
    allSubInterfacesDirect(): PiInterface[] {
        return this.language.interfaces.filter(c => c.base?.find(b => b.referred === this) !== undefined);
    }

    /**
     * returns all subinterfaces and subinterfaces of the subinterfaces
     */
    allSubInterfacesRecursive(): PiInterface[] {
        var result = this.allSubInterfacesDirect();
        const tmp = this.allSubInterfacesDirect();
        tmp.forEach(concept => result = result.concat(concept.allSubInterfacesRecursive()));
        return result;
    }
}

export class PiConcept extends PiClassifier {
    isAbstract: boolean = false;
    isRoot:boolean = false;
    isUnit:boolean = false;
    base: PiElementReference<PiConcept>;
    interfaces: PiElementReference<PiInterface>[] = []; // the interfaces that this concept implements
    // TODO the following should be moved to the editor generator
    triggerIsRegExp: boolean;

    allPrimProperties(): PiPrimitiveProperty[] {
        let result: PiPrimitiveProperty[] = this.implementedPrimProperties();
        if (!!this.base && !!this.base.referred) {
            result = result.concat(this.base.referred.allPrimProperties());
        }
        return result;
    }

    allParts(): PiConceptProperty[] {
        let result: PiConceptProperty[] = this.implementedParts();
        if (!!this.base && !!this.base.referred) {
            result = result.concat(this.base.referred.allParts());
        }
        return result;
    }

    allReferences(): PiConceptProperty[] {
        let result: PiConceptProperty[] = this.implementedReferences();
        if (!!this.base && !!this.base.referred) {
            result = result.concat(this.base.referred.allReferences());
        }
        return result;
    }

    allProperties(): PiProperty[] {
        let result : PiProperty[] = [];
        result = result.concat(this.allPrimProperties()).concat(this.allParts()).concat(this.allReferences());
        return result;
    }

    implementedPrimProperties(): PiPrimitiveProperty[] {
        let result: PiPrimitiveProperty[] = this.primProperties;
        for (let intf of this.interfaces) {
            for (let intfProp of intf.referred.allPrimProperties()) {
                let includes = false;
                // if the prop from the interface is present in this concept, do not include
                includes = this.primProperties.some(p => p.name === intfProp.name );
                // if the prop from the interface is present in the base of this concept, do not include
                if (!includes && !!this.base && !!this.base.referred) includes = this.base.referred.allPrimProperties().some(p => p.name === intfProp.name );
                if (!includes) {
                    result = result.concat(intfProp);
                }
            }
        }
        return result;
    }

    implementedParts(): PiConceptProperty[] {
        let result: PiConceptProperty[] = this.parts();
        for (let intf of this.interfaces) {
            for (let intfProp of intf.referred.allParts()) {
                let includes = false;
                // if the prop from the interface is present in this concept, do not include
                includes = this.parts().some(p => p.name === intfProp.name);
                // if the prop from the interface is present in the base of this concept, do not include
                if (!includes && !!this.base && !!this.base.referred) includes = this.base.referred.allParts().some(p => p.name === intfProp.name);
                if (!includes) {
                    result = result.concat(intfProp);
                }
            }
        }
        return result;
    }

    implementedReferences(): PiConceptProperty[] {
        let result: PiConceptProperty[] = this.references();
        for (let intf of this.interfaces) {
            for (let intfProp of intf.referred.allReferences()) {
                let includes = false;
                // if the prop from the interface is present in this concept, do not include
                includes = this.references().some(p => p.name === intfProp.name);
                // if the prop from the interface is present in the base of this concept, do not include
                if (!includes && !!this.base && !!this.base.referred) includes = this.base.referred.allReferences().some(p => p.name === intfProp.name);
                if (!includes) {
                    result = result.concat(intfProp);
                }
            }
        }
        return result;
    }

    implementedProperties(): PiProperty[] {
        let result : PiProperty[] = [];
        result = result.concat(this.implementedPrimProperties()).concat(this.implementedParts()).concat(this.implementedReferences());
        return result;
    }

    allInterfaces() : PiInterface[] {
        let result: PiInterface[] = [];
        for (let intf of this.interfaces) {
            let realintf = intf.referred;
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
    allSubConceptsDirect(): PiConcept[] {
        return this.language.concepts.filter(c => c.base?.referred === this);
    }

    /**
     * returns all subconcepts and subconcepts of the subconcepts
     */
    allSubConceptsRecursive(): PiConcept[] {
        var result = this.allSubConceptsDirect();
        const tmp = this.allSubConceptsDirect();
        tmp.forEach(concept => result = result.concat(concept.allSubConceptsRecursive()));
        return result;
    }
}

export class PiExpressionConcept extends PiConcept {
    _isPlaceHolder: boolean;
}

export class PiBinaryExpressionConcept extends PiExpressionConcept {
    // left: PiExpressionConcept;
    // right: PiExpressionConcept;
    // TODO move to editor
    symbol: string;
    priority: number;

    getSymbol(): string {
        const p = this.symbol;
        return (!!p ? p : "undefined");
    }

    getPriority(): number {
        const p = this.priority;
        return (!!p ? p : -1);
    }
}

export class PiLimitedConcept extends PiConcept {
    instances: PiInstance[] = [];
}

export class PiProperty extends PiLangElement {
    isPublic: boolean;
    isOptional: boolean;
    isList: boolean;
    isPart: boolean; // if false then it is a reference property
    type: PiElementReference<PiConcept>; // TODO this should be PiElementReference<PiClassifier>
    owningConcept: PiClassifier;
}

export class PiConceptProperty extends PiProperty {
    hasLimitedType: boolean; // set in checker
}

export class PiPrimitiveProperty extends PiProperty {
    isStatic: boolean;
	initialValue: string;
    primType: string;
    // The inherited 'type' cannot be used, because 'this' has a primitive type,
    // which is not a subtype of PiElementReference<PiConcept>
    // Therefore, here we have:
    // TODO dit moet beter worden!!!
    get type() : PiElementReference<PiConcept> {
        return PiElementReference.createNamed<PiConcept>(primitiveTypeName, "PiConcept");
    }
}

export class PiInstance extends PiLangElement {
    concept: PiElementReference<PiConcept>; // should be a limited concept
    props: PiPropertyInstance[] = [];
}

export class PiPropertyInstance extends PiLangElement {
    owningInstance: PiElementReference<PiInstance>;
    property: PiElementReference<PiProperty>;
    value: string;
}

// the following two classes are only used in the typer and validator definitions
export class PiFunction extends PiLangElement {
    language: PiLanguageUnit;
    formalparams: PiParameter[] = [];
    returnType: PiElementReference<PiConcept>;
}

export class PiParameter extends PiLangElement {
    type: PiElementReference<PiConcept>;
}

export function isBinaryExpression(elem: PiLangElement): elem is PiBinaryExpressionConcept {
    return elem instanceof PiBinaryExpressionConcept;
}

export function isExpression(elem: PiLangElement): elem is PiExpressionConcept {
    return elem instanceof PiExpressionConcept;
}

export function isLimited(elem: PiLangElement): elem is PiLimitedConcept {
    return elem instanceof PiLimitedConcept;
}
