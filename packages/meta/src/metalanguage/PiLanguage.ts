export class PiLangConceptReference {
    language: PiLanguage;
    name: string;

    constructor() {
    }

    concept(): PiLangConcept {
        return this.language.findConcept(this.name);
    }
}

export class PiLanguage {
    name: string;
    concepts: PiLangConcept[] = [];
    enumerations: PiLangEnumeration[] = [];
    types: PiLangType[] = [];

    constructor() {
    }


    findConcept(name: string): PiLangConcept {
        return this.concepts.find(con => con.name === name);
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

    contextClass(): string {
        return this.name + "Context";
    }
}

export class PiLangConcept {
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

}

export class PiLangExpressionConcept extends PiLangConcept {
}

export class PiLangBinaryExpressionConcept extends PiLangExpressionConcept {
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

export class PiLangElementProperty {
    owningConcept: PiLangConcept;

    constructor() {
    }

    name: string;
    isList: boolean;
    type: PiLangConceptReference;
}

export class PiLangEnumeration {
    language: PiLanguage;
    name: string;
    literals: string[] = [];

    constructor() {
    }
}

export class PiLangType {
    language: PiLanguage;
    name: string;
    literals: string[] = [];

    constructor() {
    }
}
