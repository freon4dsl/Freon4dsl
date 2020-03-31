import { PiLangElementReference, PiLangConceptReference, PiLangClassReference, PiLangInterfaceReference, PiLangEnumerationReference } from "./PiLangReferences";

// PiLanguage structure
export class PiLanguageUnit {
    name: string;
    classes: PiLangClass[] = [];
    enumerations: PiLangEnumeration[] = [];
    unions: PiLangUnion[] = [];
    interfaces: PiLangInterface[] = [];

    findClass(name: string): PiLangClass {
        return this.classes.find(con => con.name === name);
    }

    findEnumeration(name: string): PiLangEnumeration {
        return this.enumerations.find(con => con.name === name);
    }

    findUnion(name: string): PiLangUnion {
        return this.unions.find(con => con.name === name);
    }

    findInterface(name: string): PiLangInterface {
        return this.interfaces.find(con => con.name === name);
    }

    findConcept(name: string): PiLangConcept {
        let result : PiLangConcept;
        result = this.findClass(name);
        if (result === undefined) result = this.findUnion(name);
        if (result === undefined) result = this.findInterface(name);
        if (result === undefined) result = this.findEnumeration(name);
        return result;
    }

	findBinaryExpConcept(name: string): PiLangBinaryExpressionConcept {
        let result = this.findClass(name);
        if (result instanceof PiLangBinaryExpressionConcept) return result;
        return null;
    }
    
	findExpressionConcept(name: string): PiLangExpressionConcept {
        let result = this.findClass(name);
        if (result instanceof PiLangExpressionConcept) return result;
        return null;
    }
    
    findExpressionBase(): PiLangConcept {
        const result = this.classes.find(c => {
            return c instanceof PiLangExpressionConcept && (!!c.base ? !(c.base.referedElement() instanceof PiLangExpressionConcept) : true);
        });
        return result;
    }

    expressionPlaceholder(): PiLangConcept {
        return this.classes.find(c => c instanceof PiLangExpressionConcept && c.isExpressionPlaceholder());
    }

    rootConcept():PiLangConcept{
        return this.classes.find(c => c.isRoot);
    }
}

// root of the inheritance structure
export abstract class PiLangElement {
    name: string;
}

export class PiLangConcept extends PiLangElement {
    language: PiLanguageUnit;
    primProperties: PiLangPrimitiveProperty[] = [];
    enumProperties: PiLangEnumProperty[] = [];
    parts: PiLangConceptProperty[] = [];
    references: PiLangConceptProperty[] = [];
    trigger: string;
    triggerIsRegExp: boolean;

    // the following functions should be implemented by sybclasses
    // TODO investigate which implementations can be raised to this class
    allPrimProperties(): PiLangPrimitiveProperty[] {
        return [];
    }
    allEnumProperties(): PiLangEnumProperty[] {
        return [];
    }
    allParts(): PiLangConceptProperty[] {
        return [];
    }
    allPReferences(): PiLangConceptProperty[] {
        return [];
    }
    allProperties(): PiLangProperty[] {
        return [];
	}
	findFunction(name: string, formalparams: PiLangConceptReference[]): PiLangFunction {
		throw new Error("Method not implemented.");
	}
	findConceptProperty(name: string): PiLangConceptProperty {
		throw new Error("Method not implemented.");
	}
	findEnumProperty(name: string): PiLangEnumProperty {
		throw new Error("Method not implemented.");
	}
	findPrimitiveProperty(name: string): PiLangPrimitiveProperty {
		throw new Error("Method not implemented.");
	}
	findProperty(name: string): PiLangProperty {
        return this.allProperties().find(p => p.name === name);
	}
    getTrigger(): string {
        const p = this.trigger;
        return (!!p ? p : "undefined");
    }
}

// export interface PiLangClassInterface {
//     name: string;
//     primProperties: PiLangPrimitiveProperty[];
//     enumProperties: PiLangEnumProperty[];
//     parts: PiLangConceptProperty[];
//     references: PiLangConceptProperty[];
//     trigger: string;
//     isAbstract: boolean;
//     isRoot:boolean;
//     base: PiLangClassReference;
// }
export class PiLangClass extends PiLangConcept { // implements PiLangClassInterface {
    isAbstract: boolean;
    isRoot:boolean;
    base: PiLangClassReference;

    allPrimProperties(): PiLangPrimitiveProperty[] {
        if (this.base !== undefined) {
            return this.primProperties.concat(this.base.referedElement().allPrimProperties());
        } else {
            return this.primProperties;
        }
    }

    allEnumProperties(): PiLangEnumProperty[] {
        if (this.base !== undefined) {
            return this.enumProperties.concat(this.base.referedElement().allEnumProperties());
        } else {
            return this.enumProperties;
        }
    }

    allParts(): PiLangConceptProperty[] {
        if (this.base !== undefined) {
            return this.parts.concat(this.base.referedElement().allParts());
        } else {
            return this.parts;
        }
    }

    allPReferences(): PiLangConceptProperty[] {
        if (this.base !== undefined) {
            return this.references.concat(this.base.referedElement().allPReferences());
        } else {
            return this.references;
        }
    }

    allProperties(): PiLangProperty[] {
        let result : PiLangProperty[] = [];
        result = result.concat(this.allPrimProperties()).concat(this.allEnumProperties()).concat(this.allParts()).concat(this.allPReferences());
        return result;
    } 

    allSubConceptsDirect(): PiLangClass[] {
        return this.language.classes.filter(c => c.base?.referedElement() === this);
    }

    allSubConceptsRecursive(): PiLangClass[] {
        var result = this.language.classes.filter(c => c.base?.referedElement() === this);
        const tmp = this.language.classes.filter(c => c.base?.referedElement() === this);
        tmp.forEach(concept => result = result.concat(concept.allSubConceptsRecursive()));
        return result;
    }

    getTrigger(): string {
        const p = this.trigger;
        return (!!p ? p : "undefined");
    }

    // TODO this function should be replaced by check on instance of PiLangExpressionConcept    
    expression(): boolean {
        return false;
    }

    // TODO this function should be replaced by check on instance of PiLangBinaryExpressionConcept    
    binaryExpression(): boolean {
        return false;
    }

    // TODO this function should be replaced by check on instance of PiLangBinaryExpressionConcept    
    isExpressionPlaceholder(): boolean {
        return false;
    }
}

export class PiLangInterface extends PiLangConcept {
    base?: PiLangInterfaceReference; 
    // isExpression: boolean;  
    trigger: string;
    // triggerIsRegExp: boolean;

    allPrimProperties(): PiLangPrimitiveProperty[] {
        if (this.base !== undefined) {
            return this.primProperties.concat(this.base.referedElement().allPrimProperties());
        } else {
            return this.primProperties;
        }
    }

    allEnumProperties(): PiLangEnumProperty[] {
        if (this.base !== undefined) {
            return this.enumProperties.concat(this.base.referedElement().allEnumProperties());
        } else {
            return this.enumProperties;
        }
    }

    allParts(): PiLangConceptProperty[] {
        if (this.base !== undefined) {
            return this.parts.concat(this.base.referedElement().allParts());
        } else {
            return this.parts;
        }
    }

    allPReferences(): PiLangConceptProperty[] {
        if (this.base !== undefined) {
            return this.references.concat(this.base.referedElement().allPReferences());
        } else {
            return this.references;
        }
    }

    allProperties(): PiLangProperty[] {
        let result : PiLangProperty[] = [];
        result = result.concat(this.allPrimProperties()).concat(this.allEnumProperties()).concat(this.allParts()).concat(this.allPReferences());
        return result;
    } 

    allSubConceptsDirect(): PiLangInterface[] {
        return this.language.interfaces.filter(c => c.base?.referedElement() === this);
    }

    allSubConceptsRecursive(): PiLangInterface[] {
        var result = this.language.interfaces.filter(c => c.base?.referedElement() === this);
        const tmp = this.language.interfaces.filter(c => c.base?.referedElement() === this);
        tmp.forEach(concept => result = result.concat(concept.allSubConceptsRecursive()));
        return result;
    }

    getTrigger(): string {
        const p = this.trigger;
        return (!!p ? p : "undefined");
    }

    // TODO this function should be replaced by check on instance of PiLangExpressionConcept    
    expression(): boolean {
        return false;
    }

}

export class PiLangEnumeration extends PiLangConcept {
	literals: string[] = [];
	
	allLiterals() : string[] {
		return this.literals;
	}

	findLiteral(name: string) {
		return this.literals.find(l => l === name);
	}
}

export class PiLangUnion extends PiLangConcept {
    members: PiLangConceptReference[] = [];
    trigger: string;
    // triggerIsRegExp: boolean;

    // returns all properties that are in all of the members
    allProperties(): PiLangPrimitiveProperty[] {
        // TODO check and test this code idea
        let result : PiLangPrimitiveProperty[] = [];
        // for (let member1 of this.members) {
        //     for(let prop of member1.concept().allProperties()){
        //         let notFoundInAll = false;
        //         for (let member2 of this.members) { 
        //             if( !member2.concept().allProperties().find(p => p.name === prop.name && p.type === prop.type)) {
        //                 notFoundInAll = true;
        //             }
        //         }
        //         if (!notFoundInAll) result.push(prop);
        //     }
        // }
        return result;
    }

    getTrigger(): string {
        const p = this.trigger;
        return (!!p ? p : "undefined");
    }

    // TODO this function should be replaced by check on instance of PiLangExpressionConcept    
    expression(): boolean {
        return false;
    }
}

export class PiLangExpressionConcept extends PiLangClass {
    // isBinaryExpression: boolean;
    _isExpressionPlaceHolder: boolean;

    // TODO this function should be replaced by check on instance of PiLangExpressionConcept    
    expression(): boolean {
        return true;
    }

    // TODO this function should be replaced by check on instance of PiLangBinaryExpressionConcept    
    binaryExpression(): boolean {
        return false;
    }

    // TODO this function could (???) be replaced by check on instance of PiLangBinaryExpressionConcept    
    isExpressionPlaceholder(): boolean {
        return this._isExpressionPlaceHolder;
    }   
}

export class PiLangBinaryExpressionConcept extends PiLangExpressionConcept {
    left: PiLangConceptReference;
    right: PiLangConceptReference;
    symbol: string;
    priority: number;

    // TODO this function should be replaced by check on instance of PiLangExpressionConcept    
    expression(): boolean {
        return true;
    }

    // TODO this function should be replaced by check on instance of PiLangBinaryExpressionConcept    
    binaryExpression(): boolean {
        return true;
    }

    getSymbol(): string {
        const p = this.symbol;
        return (!!p ? p : "undefined");
    }

    getPriority(): number {
        const p = this.priority;
        return (!!p ? p : -1);
    }
}

export class PiLangProperty extends PiLangElement {
	type: PiLangElementReference;
	isList: boolean;
    owningConcept: PiLangConcept;
}

export class PiLangPrimitiveProperty extends PiLangProperty {
    isStatic: boolean;
	initialValue: string;
	// type is primitive, which is not a subtype of PiLangElementReference
	// therefore, here we have:
    primType: string;
    get type() : PiLangElementReference {
        let value : PiLangElementReference = new PiLangElementReference();
        value.name = this.primType;
        return value;
    }
}

export class PiLangEnumProperty extends PiLangProperty {
    isStatic: boolean;
    initialValue: string;
    type: PiLangEnumerationReference;
}

export class PiLangConceptProperty extends PiLangProperty {
    type: PiLangConceptReference;
    isPart: boolean; // needed for parsing
}

// the following two classes are only used in the typer and validator definitions
export class PiLangFunction extends PiLangElement {
    formalparams: PiLangParameter[];
    returnType: PiLangConceptReference;
}

export class PiLangParameter extends PiLangElement {
    type: PiLangConceptReference;
}
