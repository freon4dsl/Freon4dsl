export class PiLangConceptReference {
    language: PiLanguage;
    name: string;
 
    constructor() {
    }

    concept(): PiLangConcept {
        if(!!this.language) return this.language.findConcept(this.name);
    }
    
    element() {
        return this.concept();
    }
}
export class PiLangElementReference {
    language: PiLanguage;
    name: string;
 
    constructor() {
    }

    element(): PiLangElement {
        let result : PiLangElement;
        if(!!this.language) {
            result = this.language.findConcept(this.name);
            if(result === undefined) result = this.language.findEnumeration(this.name);
            if(result === undefined) result = this.language.findUnion(this.name);
        }
        return result;
    }
}

export class PiLangPropertyReference {
    language: PiLanguage;
    owningelement: PiLangElementReference;
    name: string;

    property(): PiLangProperty {
        let result : PiLangProperty;
        if(!!this.language) {
            let concept = this.owningelement.element();
            if(!!concept) { 
                result = concept.findProperty(this.name);
            }
        }
        return result; 
    }
}
abstract class PiLangElement {
    findProperty(name: string): PiLangProperty {
        let result : PiLangProperty;
        // should be implemented by subclasses!!!
        return result;
    }
    name: string
}

export class PiLanguage {
    name: string;
    concepts: PiLangConcept[] = [];
    enumerations: PiLangEnumeration[] = [];
    unions: PiLangUnion[] = [];

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

    findExpressionBase(): PiLangConcept {
        const result = this.concepts.find(c => {
            return c.isExpression && (!!c.base ? !(c.base.concept().isExpression) : true);
        });
        return result;
    }

    expressionPlaceholder(): PiLangConcept {
        return this.concepts.find(c => c.isExpression && c.isExpressionPlaceHolder);
    }

    rootConcept():PiLangConcept{
        return this.concepts.find(c => c.isRoot);
    }

    // TODO should this one be moved to Names???
    contextClass(): string {
        return this.name + "Context";
    }
}

export class PiLangConcept extends PiLangElement {
    language: PiLanguage;
    name: string;
    isAbstract: boolean;
    isRoot:boolean;
    base: PiLangConceptReference;
    properties: PiLangPrimitiveProperty[] = [];
    parts: PiLangElementProperty[] = [];
    references: PiLangElementProperty[] = [];
    isExpression: boolean;
    isBinaryExpression: boolean;
    isExpressionPlaceHolder: boolean;
    left?: PiLangConceptReference;
    right?: PiLangConceptReference;
    symbol?: string;
    trigger?: string;
    triggerIsRegExp?: boolean;
    priority?: number;

    constructor() {
        super();
    }

    getSymbol(): string {
        const p = this.symbol;
        return (!!p ? p : "undefined");
    }

    getTrigger(): string {
        const p = this.trigger;
        return (!!p ? p : "undefined");
    }

    getPriority(): number {
        const p = this.priority;
        return (!!p ? p : -1);
    }

    binaryExpression(): boolean {
        return (this.isBinaryExpression ? true : (this.base ? this.base.concept().binaryExpression() : false));
    }

    expression(): boolean {
        return (this.isExpression ? true : (this.base ? this.base.concept().expression() : false));
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

    findProperty(name: string): PiLangProperty {
        let result: PiLangProperty;
        result = this.properties.find( elem => elem.name === name);
        if(result === undefined) result = this.parts.find( elem => elem.name === name);
        if(result === undefined) result = this.references.find( elem => elem.name === name);
        return result;
    }
}

export class PiLangExpressionConcept extends PiLangConcept {
}

export class PiLangBinaryExpressionConcept extends PiLangExpressionConcept {
}

export abstract class PiLangProperty {
    owningConcept: PiLangConcept;
}
export class PiLangPrimitiveProperty extends PiLangProperty {

    constructor() {
        super();
    }

    name: string;
    isList: boolean;
    isStatic: boolean;
    initialValue: string;
    type: string;
}

export class PiLangElementProperty extends PiLangProperty {

    constructor() {
        super();
    }

    name: string;
    isList: boolean;
    type: PiLangConceptReference;
}
export class PiLangEnumeration extends PiLangElement {
    language: PiLanguage;
    name: string;
    literals: string[] = [];

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

export class PiLangEnumProperty extends PiLangProperty {

    constructor() {
        super();
    }

    name: string;
}

export class PiLangUnion extends PiLangElement {
    language: PiLanguage;
    name: string;
    members: PiLangConceptReference[];
    //literals: string[] = [];

    constructor() {
        super();
    }
    
}
