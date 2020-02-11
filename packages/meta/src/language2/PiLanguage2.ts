export class PiLangConceptReference2 {
    language: PiLanguage2;
    name: string;

    constructor() {
    }

    concept(): PiLangConcept2 {
        return this.language.findConcept(this.name);
    }
}

export class PiLanguage2 {
    name: string;
    concepts: PiLangConcept2[];
    enumerations: PiLangEnumeration2[];

    constructor() {
    }

    findConcept(name: string): PiLangConcept2 {
        return this.concepts.find(con => con.name === name);
    }

    findExpressionBase(): PiLangConcept2 {
        return this.concepts.find(c => c.isExpression && (c.base ? !(c.base.concept().isExpression) : true));
    }

    expressionPlaceholder(): PiLangConcept2 {
        return this.concepts.find(c => c.isExpression && c.isExpressionPlaceHolder);
    }

    rootConcept():PiLangConcept2{
        return this.concepts.find(c => c.isRoot);
    }

    contextClass(): string {
        return this.name + "Context";
    }
}

export class PiLangConcept2 {
    readonly language: PiLanguage2;
    name: string;
    isAbstract: boolean;
    isRoot:boolean;
    base: PiLangConceptReference2;
    properties: PiLangPrimitiveProperty2[];
    parts: PiLangElementProperty2[];
    references: PiLangElementProperty2[];
    isExpression: boolean;
    isBinaryExpression: boolean;
    isExpressionPlaceHolder: boolean;
    left?: PiLangConceptReference2;
    right?: PiLangConceptReference2;
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

    allProperties(): PiLangPrimitiveProperty2[] {
        if (this.base !== undefined) {
            return this.properties.concat(this.base.concept().allProperties());
        } else {
            return this.properties;
        }
    }

    allParts(): PiLangElementProperty2[] {
        if (this.base !== undefined) {
            return this.parts.concat(this.base.concept().allParts());
        } else {
            return this.parts;
        }
    }

    allPReferences(): PiLangElementProperty2[] {
        if (this.base !== undefined) {
            return this.references.concat(this.base.concept().allPReferences());
        } else {
            return this.references;
        }
    }

    allSubConceptsDirect(): PiLangConcept2[] {
        return this.language.concepts.filter(c => c.base.concept() === this);
    }

    allSubConceptsRecursive(): PiLangConcept2[] {
        var result = this.language.concepts.filter(c => c.base.concept() === this);
        const tmp = this.language.concepts.filter(c => c.base.concept() === this);
        tmp.forEach(concept => result = result.concat(concept.allSubConceptsRecursive()));
        return result;
    }

}

export class PiLangExpressionConcept2 extends PiLangConcept2 {
}

export class PiLangBinaryExpressionConcept2 extends PiLangExpressionConcept2 {
}

export class PiLangPrimitiveProperty2 {
    owningConcept: PiLangConcept2;

    constructor() {
    }

    name: string;
    isList: boolean;
    isStatic: boolean;
    initialValue: string;
    type: string;
}

export class PiLangElementProperty2 {
    owningConcept: PiLangConcept2;

    constructor() {
    }

    name: string;
    isList: boolean;
    type: PiLangConceptReference2;
}

export class PiLangEnumeration2 {
    language: PiLanguage2;
    name: string;
    literals: string[];

    constructor() {
    }
}
