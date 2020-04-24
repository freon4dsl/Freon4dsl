import { ParseLocation } from "../../utils";
import { PiElementReference } from "./PiElementReference";

// root of the inheritance structure
export abstract class PiLangElement {
    location: ParseLocation;
    name: string;
}

export class PiLanguageUnit extends PiLangElement {
    concepts: PiConcept[] = [];
    interfaces: PiInterface[] = [];
    expressionPlaceHolder: PiExpressionConcept; // set by checker
    rootConcept: PiConcept; // set by the checker

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

    findExpressionBase(): PiConcept {
        const result = this.concepts.find(c => {
            return c instanceof PiExpressionConcept && (!!c.base ? !(c.base.referred instanceof PiExpressionConcept) : true);
        });
        return result;
    }
}

export abstract class PiClassifier extends PiLangElement {
    language: PiLanguageUnit;
    properties: PiProperty[];
    primProperties: PiPrimitiveProperty[];

    parts(): PiConceptProperty[] {
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
            result = result.concat(intf.referred.allParts());
        }
        return result;
    }
}

export class PiConcept extends PiClassifier {
    isAbstract: boolean;
    isRoot:boolean;
    base: PiElementReference<PiConcept>;
    interfaces: PiElementReference<PiInterface>[] = []; // the interfaces that this concept implements
    // TODO the following should be moved to the editor generator
    triggerIsRegExp: boolean;

    allPrimProperties(): PiPrimitiveProperty[] {
        let result: PiPrimitiveProperty[] = this.primProperties;
        if (this.base !== undefined) {
            result = result.concat(this.base.referred.allPrimProperties());
        }
        for (let intf of this.interfaces) {
            result = result.concat(intf.referred.allPrimProperties());
        }
        return result;
    }

    allParts(): PiConceptProperty[] {
        let result: PiConceptProperty[] = this.parts();
        if (this.base !== undefined) {
            result = result.concat(this.base.referred.allParts());
        }
        for (let intf of this.interfaces) {
            result = result.concat(intf.referred.allParts());
        }
        return result;
    }

    allReferences(): PiConceptProperty[] {
        let result: PiConceptProperty[] = this.references();
        if (this.base !== undefined) {
            result = result.concat(this.base.referred.allParts());
        }
        for (let intf of this.interfaces) {
            result = result.concat(intf.referred.allParts());
        }
        return result;
    }

    implementedPrimProperties(): PiPrimitiveProperty[] {
        let result: PiPrimitiveProperty[] = this.primProperties;
        for (let intf of this.interfaces) {
            result = result.concat(intf.referred.allPrimProperties());
        }
        return result;
    }

    implementedParts(): PiConceptProperty[] {
        let result: PiConceptProperty[] = this.parts();
        for (let intf of this.interfaces) {
            result = result.concat(intf.referred.allParts());
        }
        return result;
    }

    implementedPReferences(): PiConceptProperty[] {
        let result: PiConceptProperty[] = this.references();
        for (let intf of this.interfaces) {
            result = result.concat(intf.referred.allReferences());
        }
        return result;
    }

    implementedProperties(): PiProperty[] {
        let result : PiProperty[] = [];
        result = result.concat(this.implementedPrimProperties()).concat(this.implementedParts()).concat(this.implementedPReferences());
        return result;
    }

    allSubConceptsDirect(): PiConcept[] {
        return this.language.concepts.filter(c => c.base?.referred === this);
    }

    allSubConceptsRecursive(): PiConcept[] {
        var result = this.language.concepts.filter(c => c.base?.referred === this);
        const tmp = this.language.concepts.filter(c => c.base?.referred === this);
        tmp.forEach(concept => result = result.concat(concept.allSubConceptsRecursive()));
        return result;
    }
}

export class PiExpressionConcept extends PiConcept {
    _isPlaceHolder: boolean;

    isExpressionPlaceholder(): boolean {
        return this._isPlaceHolder;
    }
}

export class PiBinaryExpressionConcept extends PiExpressionConcept {
    left: PiExpressionConcept;
    right: PiExpressionConcept;
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
    instances: PiInstance[];
}

export class PiProperty extends PiLangElement {
    isOptional: boolean;
    isList: boolean;
    isPart: boolean; // if false then it is a reference property
    type: PiElementReference<PiConcept>; // TODO this should be PiElementReference<PiClassifier>
    owningConcept: PiElementReference<PiConcept>;
}

export class PiConceptProperty extends PiProperty {
    hasLimitedType: boolean; // set in checker
}

export class PiPrimitiveProperty extends PiProperty {
    isStatic: boolean;
	initialValue: string;
    primType: string;
    // The inherited 'type' cannot be used, because 'this' has a primitive type,
    // which is not a subtype of PiReference<PiClassifier>
    // Therefore, here we have:
    get type() : PiElementReference<PiConcept> {
        let value : PiElementReference<PiConcept>; // = new PiElementReference<PiConcept>(this.primType, "string");
        value.name = this.primType;
        return value;
    }
}

export class PiInstance extends PiLangElement {
    concept: PiElementReference<PiConcept>; // should be a limited concept
    props: PiPropertyInstance[];
}

export class PiPropertyInstance extends PiLangElement {
    property: PiElementReference<PiProperty>;
    value: string;
}

// the following two classes are only used in the typer and validator definitions
export class PiFunction extends PiLangElement {
    language: PiLanguageUnit;
    formalparams: PiParameter[];
    returnType: PiElementReference<PiConcept>;
}

export class PiParameter extends PiLangElement {
    type: PiElementReference<PiConcept>;
}
