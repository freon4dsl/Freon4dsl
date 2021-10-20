import { PiElementReference } from "./internal";
import { PiDefinitionElement } from "../../utils/PiDefinitionElement";

// root of the inheritance structure of all elements in a language definition
export abstract class PiLangElement extends PiDefinitionElement {
    name: string;
}

export class PiLanguage extends PiLangElement {
    concepts: PiConcept[] = [];
    interfaces: PiInterface[] = [];
    modelConcept: PiModelDescription;
    units: PiUnitDescription[] = [];

    constructor() {
        super();
    }

    // get units(): PiConcept[] {
    //     return this.concepts.filter(con => con.isUnit === true);
    // }

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
        if (result === undefined) {
            result = this.findUnitDescription(name);
        }
        // if (result === undefined) {
        //     result = this.findBasicType(name);
        // }
        return result;
    }

    findExpressionBase(): PiExpressionConcept {
        // TODO why the return inside the find???
        // TODO rethink the inheritance structure of expressions: should binaries always inherit from expression, and more questions!
        // TODO the following depends on the order of concepts in the .ast file
        const result = this.concepts.find(c => {
            return c instanceof PiExpressionConcept && (!!c.base ? !(c.base.referred instanceof PiExpressionConcept) : true);
        });
        return result as PiExpressionConcept;
    }

    findBasicType(name:string): PiClassifier {
        return PiPrimitiveType.find(name);
    }

    findUnitDescription(name: string): PiUnitDescription {
        return this.units.find(u => u.name === name);
    }
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

export class PiModelDescription extends PiClassifier {
    unitTypes(): PiUnitDescription[] {
        let result: PiUnitDescription[] = [];
        // all parts of a model are units
        for (const intf of this.parts()) {
            result = result.concat(intf.type.referred as PiUnitDescription);
        }
        return result;
    }
}

export class PiUnitDescription extends PiClassifier {
    fileExtension: string = "";
    isPublic = true;
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
    base: PiElementReference<PiConcept>;
    interfaces: PiElementReference<PiInterface>[] = []; // the interfaces that this concept implements

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
    initialValue: PiPrimitiveValue;
    initialValueList: PiPrimitiveValue[];
    // primType: string;
    // The inherited 'type' cannot be used, because 'this' has a primitive type,
    // which is not a subtype of PiElementReference<PiConcept>
    // Therefore, here we have:
    // type: PiElementReference<PiConcept> = PiElementReference.createNamed<PiConcept>(primitiveValueName, "PiConcept");

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
    value: PiPrimitiveValue;
    valueList: PiPrimitiveValue[];
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

// the basic types in the pi-languages
export type PiPrimitiveValue = string | boolean | number ;

export class PiPrimitiveType extends PiConcept {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PiPrimitiveType>): PiPrimitiveType {
        const result = new PiPrimitiveType();
        if (!!data.name) {
            result.name = data.name;
        }
        return result;
    }

    static string: PiPrimitiveType = PiPrimitiveType.create({name: "string"});
    static number: PiPrimitiveType = PiPrimitiveType.create({name: "number"});
    static boolean: PiPrimitiveType = PiPrimitiveType.create({name: "boolean"});
    static identifier: PiPrimitiveType = PiPrimitiveType.create({name: "identifier"});
    static $piANY: PiPrimitiveType; // default predefined instance

    static find(name: string) {
        switch (name) {
            case "string" : return this.string;
            case "boolean" : return this.boolean;
            case "identifier" : return this.identifier;
            case "number" : return this.number;
        }
        // TODO see whether we need to return null?
        return this.$piANY;
    }
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
