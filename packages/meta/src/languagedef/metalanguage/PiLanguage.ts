import { PiLangConceptReference, PiLangEnumerationReference } from "./PiLangReferences";

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
    enumProperties: PiLangEnumerationProperty[] = [];
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
    base?: PiLangInterface; 
    properties: PiLangPrimitiveProperty[] = [];
    enumproperties: PiLangEnumProperty[] = [];
    parts: PiLangElementProperty[] = [];
    references: PiLangElementProperty[] = [];

    isExpression: boolean;  
}

export class PiLangUnion {
    language: PiLanguageUnit;
    name: string;
    members: PiLangConceptReference[] = [];

    constructor() {
    }
}

export type PiCI_Type = PiLangConcept | PiLangInterface;

export type PiCUI_Type = PiLangConcept | PiLangUnion | PiLangInterface ;

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
    name: string;
    isList: boolean;
}

export class PiLangPrimitiveProperty {
    owningConcept: PiLangConcept;

    constructor() {
    }

    name: string;
    isList: boolean;
    isStatic: boolean;
    initialValue: string;
    type: string;
}

export class PiLangEnumerationProperty {
    owningConcept: PiLangConcept;

    constructor() {
    }

    name: string;
    isList: boolean;
    isStatic: boolean;
    initialValue: string;
    type: PiLangEnumerationReference;
}

export class PiLangElementProperty {
    owningConcept: PiLangConcept;

    constructor() {
    }

    name: string;
    isList: boolean;
    type: PiLangConceptReference;
}

export class PiLangEnumeration {
    language: PiLanguageUnit;
    name: string;
    literals: string[] = [];

    constructor() {
    }
}

