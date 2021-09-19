import { PiElementReference } from "./internal";
import { PiDefinitionElement } from "../../utils/PiDefinitionElement";

export interface identifier {
}
const primitiveTypeName = "PiPrimitiveType";
export type PiPrimitiveType = string | boolean | number | identifier;

// root of the inheritance structure of all elements in a language definition
export abstract class PiLangElement extends PiDefinitionElement {
    name: string;
}

export class PiLanguage extends PiLangElement {
    concepts: PiConcept[] = [];
    interfaces: PiInterface[] = [];
    // predefInstances: PiInstance[] = [];
    modelConcept: PiConcept; // set by the checker

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
        let result: PiClassifier;
        result = this.findConcept(name);
        if (result === undefined) {
            result = this.findInterface(name);
        }
        return result;
    }

    findExpressionBase(): PiExpressionConcept {
        const result = this.concepts.find(c => {
            return c instanceof PiExpressionConcept && (!!c.base ? !(c.base.referred instanceof PiExpressionConcept) : true);
        });
        return result as PiExpressionConcept;
    }

    // private addPredefinedElements() {
    //     // make the primitive types
    //     const primitiveTypeConcept = new PiLimitedConcept();
    //     primitiveTypeConcept.name = "PiPrimitiveType";
    //     primitiveTypeConcept.language = this;
    //     this.concepts.push(primitiveTypeConcept);
    //     const STRING = new PiInstance();
    //     STRING.name = "string";
    //     STRING.concept = PiElementReference.create<PiConcept>(primitiveTypeConcept, "PiConcept");
    //     STRING.concept.owner = STRING;
    //     this.predefInstances.push(STRING);
    //     const NUMBER = new PiInstance();
    //     NUMBER.name = "number";
    //     NUMBER.concept = PiElementReference.create<PiConcept>(primitiveTypeConcept, "PiConcept");
    //     NUMBER.concept.owner = NUMBER;
    //     this.predefInstances.push(NUMBER);
    //     const BOOLEAN = new PiInstance();
    //     BOOLEAN.name = "boolean";
    //     BOOLEAN.concept = PiElementReference.create<PiConcept>(primitiveTypeConcept, "PiConcept");
    //     BOOLEAN.concept.owner = BOOLEAN;
    //     this.predefInstances.push(BOOLEAN);
    //     // TODO make the predefined functions
    // }
}

export abstract class PiClassifier extends PiLangElement {
    language: PiLanguage;
    isPublic: boolean;
    properties: PiProperty[] = [];
    primProperties: PiPrimitiveProperty[] = [];

    parts(): PiConceptProperty[] {
        return this.properties.filter(p => p instanceof PiConceptProperty && p.isPart) as PiConceptProperty[];
    }

    references(): PiConceptProperty[] {
        return this.properties.filter(p => p instanceof PiConceptProperty && !p.isPart) as PiConceptProperty[];
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
        let result: PiProperty[] = [];
        result = result.concat(this.allPrimProperties()).concat(this.allParts()).concat(this.allReferences());
        return result;
    }
}

export class PiInterface extends PiClassifier {
    base: PiElementReference<PiInterface>[] = [];

    allPrimProperties(): PiPrimitiveProperty[] {
        let result: PiPrimitiveProperty[] = this.primProperties;
        for (const intf of this.base) {
            result = result.concat(intf.referred.allPrimProperties());
        }
        return result;
    }

    allParts(): PiConceptProperty[] {
        let result: PiConceptProperty[] = this.parts();
        for (const intf of this.base) {
            result = result.concat(intf.referred.allParts());
        }
        return result;
    }

    allReferences(): PiConceptProperty[] {
        let result: PiConceptProperty[] = this.references();
        for (const intf of this.base) {
            result = result.concat(intf.referred.allReferences());
        }
        return result;
    }

    allProperties(): PiProperty[] {
        let result: PiProperty[] = [];
        result = result.concat(this.allPrimProperties()).concat(this.allParts()).concat(this.allReferences());
        return result;
    }

    allBaseInterfaces(): PiInterface[] {
        let result: PiInterface[] = [];
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
    allSubInterfacesDirect(): PiInterface[] {
        return this.language.interfaces.filter(c => c.base?.find(b => b.referred === this) !== undefined);
    }

    /**
     * returns all subinterfaces and subinterfaces of the subinterfaces
     */
    allSubInterfacesRecursive(): PiInterface[] {
        let result = this.allSubInterfacesDirect();
        const tmp = this.allSubInterfacesDirect();
        tmp.forEach(concept => result = result.concat(concept.allSubInterfacesRecursive()));
        return result;
    }
}

export class PiConcept extends PiClassifier {
    isAbstract: boolean = false;
    isModel: boolean = false;
    isUnit: boolean = false;
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
        let result: PiProperty[] = [];
        result = result.concat(this.allPrimProperties()).concat(this.allParts()).concat(this.allReferences());
        return result;
    }

    implementedPrimProperties(): PiPrimitiveProperty[] {
        let result: PiPrimitiveProperty[] = this.primProperties;
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

    implementedParts(): PiConceptProperty[] {
        let result: PiConceptProperty[] = this.parts();
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

    implementedReferences(): PiConceptProperty[] {
        let result: PiConceptProperty[] = this.references();
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

    implementedProperties(): PiProperty[] {
        let result: PiProperty[] = [];
        result = result.concat(this.implementedPrimProperties()).concat(this.implementedParts()).concat(this.implementedReferences());
        return result;
    }

    allInterfaces(): PiInterface[] {
        let result: PiInterface[] = [];
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
    allSubConceptsDirect(): PiConcept[] {
        return this.language.concepts.filter(c => c.base?.referred === this);
    }

    /**
     * returns all subconcepts and subconcepts of the subconcepts
     */
    allSubConceptsRecursive(): PiConcept[] {
        let result = this.allSubConceptsDirect();
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

    findInstance(name: string): PiInstance {
        return this.instances.find(inst => inst.name === name);
    }
}

export class PiProperty extends PiLangElement {
    isPublic: boolean;
    isOptional: boolean;
    isList: boolean;
    isPart: boolean; // if false then it is a reference property
    type: PiElementReference<PiClassifier>;
    owningConcept: PiClassifier;

    get isPrimitive(): boolean {
        return false;
    };
}

export class PiConceptProperty extends PiProperty {
    hasLimitedType: boolean; // set in checker
}

export class PiPrimitiveProperty extends PiProperty {
    isStatic: boolean;
    // only one of 'initialValue' and 'initialValueList' may have a value
    initialValue: PiPrimitiveType;
    initialValueList: PiPrimitiveType[];
    primType: string;
    // The inherited 'type' cannot be used, because 'this' has a primitive type,
    // which is not a subtype of PiElementReference<PiConcept>
    // Therefore, here we have:
    type: PiElementReference<PiConcept> = PiElementReference.createNamed<PiConcept>(primitiveTypeName, "PiConcept");

    get isPrimitive(): boolean {
        return true;
    };
}

export class PiInstance extends PiLangElement {
    concept: PiElementReference<PiConcept>; // should be a limited concept
    props: PiPropertyInstance[] = [];
}

export class PiPropertyInstance extends PiLangElement {
    owningInstance: PiElementReference<PiInstance>;
    property: PiElementReference<PiProperty>;
    value: PiPrimitiveType;
    valueList: PiPrimitiveType[];
}

// the following two classes are only used in the typer and validator definitions
export class PiFunction extends PiLangElement {
    language: PiLanguage;
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
