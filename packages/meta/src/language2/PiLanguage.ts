import {
    PiLanguageDef,
    PiLanguageConceptDef,
    PiLanguageConceptReferenceDef,
    PiLanguageElementPropertyDef, PiLanguageEnumerationDef, PiLanguagePrimitivePropertyDef
} from "./PiLanguageDef";

export class PiLangConceptReference {
    language: PiLanguage;
    name: string;

    constructor(language: PiLanguage, def: PiLanguageConceptReferenceDef) {
        this.language = language;
        this.name = def.concept;
    }

    concept(): PiLangConcept {
        return this.language.findConcept(this.name);
    }
}

export class PiLanguage {
    lang: PiLanguageDef;
    name: string;
    concepts: PiLangConcept[];
    enumerations: PiLangEnumeration[];

    constructor(language: PiLanguageDef) {
        this.lang = language;
        this.name = language.name;
        this.concepts = this.lang.concepts.map(c => new PiLangConcept(this, c));
        this.enumerations = this.lang.enumerations.map(e => new PiLangEnumeration(this, e));
    }

    findConcept(name: string): PiLangConcept {
        return this.concepts.find(con => con.name === name);
    }

    findExpressionBase(): PiLangConcept {
        return this.concepts.find(c => c.isExpression && (c.base ? !(c.base.concept().isExpression) : true));
    }

    rootConcept():PiLangConcept{
        return this.concepts.find(c => c.isRoot);
    }

    contextClass(): string {
        return this.name + "Context";
    }
}

export class PiLangConcept {
    readonly language: PiLanguage;
    name: string;
    isAbstract: boolean;
    isRoot:boolean;
    base: PiLangConceptReference;
    properties: PiLangPrimitiveProperty[];
    parts: PiLangElementProperty[];
    references: PiLangElementProperty[];
    isExpression: boolean;
    isBinaryExpression: boolean;
    isExpressionPlaceHolder: boolean;
    left?: PiLanguageConceptReferenceDef;
    right?: PiLanguageConceptReferenceDef;
    symbol?: string;
    priority?: number;

    constructor(lang: PiLanguage, conceptDef: PiLanguageConceptDef) {
        this.language = lang;
        this.name = conceptDef.name;
        this.isAbstract = !!(conceptDef.isAbstract);
        this.isRoot = !!(conceptDef.isRoot);
        this.isExpression = !!(conceptDef.isExpression);
        this.isBinaryExpression = !!(conceptDef.isBinaryExpression);
        this.isExpressionPlaceHolder = !!(conceptDef.isExpressionPlaceHolder);
        this.base = (conceptDef.base !== undefined ? new PiLangConceptReference(lang, conceptDef.base) : undefined);
        this.properties = conceptDef.properties.map(prop => new PiLangPrimitiveProperty(this, prop));
        this.parts = conceptDef.parts.map(part => new PiLangElementProperty(this, part));
        this.references = conceptDef.references.map(ref => new PiLangElementProperty(this, ref));
        this.initEditor(conceptDef);
    }

    private initEditor(conceptDef: PiLanguageConceptDef) {
        const symbol = conceptDef.editor.find(e => e.name === "symbol");
        if (!!symbol ) {
            this.symbol = symbol.initialValue;
        }
        const priority = conceptDef.editor.find(e => e.name === "priority");
        if (!!priority) {
            this.priority = Number.parseInt(priority.initialValue);
        }
    }

    getSymbol(): string {
        const p = this.symbol;
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
    concept: PiLangConcept;

    constructor(parent: PiLangConcept, def: PiLanguagePrimitivePropertyDef) {
        this.concept = parent;
        this.name = def.name;
        this.isList = !!(def.isList);
        this.isStatic = !!(def.isStatic);
        this.type = def.type;
        this.initialValue = def.initialValue;
    }

    name: string;
    isList: boolean;
    isStatic: boolean;
    initialValue: string;
    type: string;
}

export class PiLangElementProperty {
    concept: PiLangConcept;

    constructor(parent: PiLangConcept, def: PiLanguageElementPropertyDef) {
        this.concept = parent;
        this.name = def.name;
        this.isList = !!(def.isList);
        this.type = new PiLangConceptReference(parent.language, def.type);
    }

    name: string;
    isList: boolean;
    type: PiLangConceptReference;
}

export class PiLangEnumeration {
    language: PiLanguage;
    name: string;
    literals: string[];

    constructor(parent: PiLanguage, def: PiLanguageEnumerationDef) {
        this.language = parent;
        this.name = def.name;
        this.literals = def.literals.map(l => l);
    }
}
