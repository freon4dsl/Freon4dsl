import { PiLangConceptReference, PiLangEnumerationReference, PiLangCUIReference, PiLangInterfaceReference } from "./PiLangReferences";

export class PiLanguageUnit {
    name: string;
    concepts: PiLangConcept[] = [];
    enumerations: PiLangEnumeration[] = [];
    unions: PiLangUnion[] = [];
    interfaces: PiLangInterface[] = [];

    constructor() {
    }

    findConcept(name: string): PiLangConcept {
        return this.concepts.find(con => con.name === name);
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

    findCUI(name: string): PiLangCUI {
        let result : PiLangCUI;
        result = this.findConcept(name);
        if (!!result) result = this.findUnion(name);
        if (!!result) result = this.findInterface(name);
        return result;
    }

    findExpressionBase(): PiLangConcept {
        const result = this.concepts.find(c => {
            return c instanceof PiLangExpressionConcept && (!!c.base ? !(c.base.concept() instanceof PiLangExpressionConcept) : true);
        });
        return result;
    }

    expressionPlaceholder(): PiLangConcept {
        return this.concepts.find(c => c instanceof PiLangExpressionConcept && c.isExpressionPlaceholder());
    }

    rootConcept():PiLangConcept{
        return this.concepts.find(c => c.isRoot);
    }
}

export class PiLangConcept {
    language: PiLanguageUnit;
    name: string;
    isAbstract: boolean;
    isRoot:boolean;
    base: PiLangConceptReference;
    properties: PiLangPrimitiveProperty[] = [];
    enumProperties: PiLangEnumProperty[] = [];
    parts: PiLangElementProperty[] = [];
    references: PiLangElementProperty[] = [];
    trigger: string;
    triggerIsRegExp: boolean;

    constructor() {
    }

    allProperties(): PiLangPrimitiveProperty[] {
        if (this.base !== undefined) {
            return this.properties.concat(this.base.concept().allProperties());
        } else {
            return this.properties;
        }
    }

    allParts(): PiLangElementProperty[] {
        if (this.base !== undefined) {
            return this.parts.concat(this.base.concept().allParts());
        } else {
            return this.parts;
        }
    }

    allPReferences(): PiLangElementProperty[] {
        if (this.base !== undefined) {
            return this.references.concat(this.base.concept().allPReferences());
        } else {
            return this.references;
        }
    }

    allSubConceptsDirect(): PiLangConcept[] {
        return this.language.concepts.filter(c => c.base.concept() === this);
    }

    allSubConceptsRecursive(): PiLangConcept[] {
        var result = this.language.concepts.filter(c => c.base.concept() === this);
        const tmp = this.language.concepts.filter(c => c.base.concept() === this);
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

export class PiLangInterface {
    language: PiLanguageUnit;
    name: string;  
    base?: PiLangInterfaceReference; 
    properties: PiLangPrimitiveProperty[] = [];
    enumproperties: PiLangEnumProperty[] = [];
    parts: PiLangElementProperty[] = [];
    references: PiLangElementProperty[] = [];
    // isExpression: boolean;  
    trigger: string;
    // triggerIsRegExp: boolean;

    allProperties(): PiLangPrimitiveProperty[] {
        if (this.base !== undefined) {
            return this.properties.concat(this.base.concept().allProperties());
        } else {
            return this.properties;
        }
    }

    allParts(): PiLangElementProperty[] {
        if (this.base !== undefined) {
            return this.parts.concat(this.base.concept().allParts());
        } else {
            return this.parts;
        }
    }

    allPReferences(): PiLangElementProperty[] {
        if (this.base !== undefined) {
            return this.references.concat(this.base.concept().allPReferences());
        } else {
            return this.references;
        }
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

export class PiLangUnion {
    language: PiLanguageUnit;
    name: string;
    members: PiLangConceptReference[] = [];
    trigger: string;
    // triggerIsRegExp: boolean;

    constructor() {
    }
    
    // returns all properties that are in all of the members
    allProperties(): PiLangPrimitiveProperty[] {
        // TODO test this code
        let result : PiLangPrimitiveProperty[] = [];
        for (let member1 of this.members) {
            for(let prop of member1.concept().allProperties()){
                let notFoundInAll = false;
                for (let member2 of this.members) { 
                    if( !member2.concept().allProperties().find(p => p.name === prop.name && p.type === prop.type)) {
                        notFoundInAll = true;
                    }
                }
                if (!notFoundInAll) result.push(prop);
            }
        }
        return result;
    }

    allParts(): PiLangElementProperty[] {
        // if (this.base !== undefined) {
        //     return this.parts.concat(this.base.concept().allParts());
        // } else {
        //     return this.parts;
        // }
        // TODO find right implementation
        return null;
    }

    allPReferences(): PiLangElementProperty[] {
        // if (this.base !== undefined) {
        //     return this.references.concat(this.base.concept().allPReferences());
        // } else {
        //     return this.references;
        // }
        // TODO find right implementation
        return null;
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

export type PiCI_Type = PiLangConcept | PiLangInterface;

export type PiLangCUI = PiLangConcept | PiLangUnion | PiLangInterface ;

export class PiLangExpressionConcept extends PiLangConcept {
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

export class PiLangProperty {
    // TODO should 'owningConcept be replaced by piContainer()????
    owningConcept: PiLangConcept;
    name: string;
    isList: boolean;
}

export class PiLangPrimitiveProperty extends PiLangProperty {
    isStatic: boolean;
    initialValue: string;
    type: PiPrimTypesEnum;

    constructor() {
        super();
    }
}

export class PiLangEnumProperty extends PiLangProperty {
    isStatic: boolean;
    initialValue: string;
    type: PiLangEnumerationReference;

    constructor() {
        super();
    }
}

export class PiLangElementProperty extends PiLangProperty {
    type: PiLangCUIReference;

    constructor() {
        super();
    }

    // findProperty(name:string) : PiLangProperty {
    //     let result: PiLangEnumProperty = new PiLangEnumProperty();
    //     let literal  = this.literals.find( elem => elem === name);
    //     if(!(!!literal)) result.name = literal; 
    //     return result;
    // }
}
export class PiLangCUIProperty extends PiLangProperty {
    type: PiLangCUIReference;

    constructor() {
        super();
    }
}
export class PiLangEnumeration {
    language: PiLanguageUnit;
    name: string;
    literals: string[] = [];

    constructor() {
    }
    
}

export enum PiPrimTypesEnum {
    string = "string", 
    number = "number", 
    boolean = "boolean"
}

