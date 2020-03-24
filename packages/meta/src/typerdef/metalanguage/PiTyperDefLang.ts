import { PiLangConceptReference, PiLangElementReference } from "../../languagedef/metalanguage/PiLangReferences";
import { PiLangExp, PiLangAppliedFeatureExp, PiLangEnumExp } from "../../languagedef/metalanguage/PiLangExpressions";

export class PiTyperDef {
    name: string;
    languageName: string;
    typerRules: PiTyperRule[];

    constructor() { 
    }
}

export abstract class PiTyperRule {   
    toPiString() : string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'PiTyperDefLang.PiTypeRule'";
    }
}
export class InferenceRule extends PiTyperRule {
    conceptRef: PiLangConceptReference
    calculation: PiCalculation;
    isAbstract: boolean;

    toPiString(): string {
        return `${this.conceptRef.referedElement().name} @inferType { ${this.calculation.toPiString() } }`;
    }
}

export class IsTypeRule extends PiTyperRule {
    types: PiLangConceptReference[] = [];

    toPiString(): string {
        return `@isType { ${this.types.map( t => t.name ).join(", ")} }`;
    }
}

export class TypeEqualsRule extends PiTyperRule {
    type1: PiTypeValue; 
    type2: PiTypeValue;
    value: boolean;

    toPiString(): string {
        return `@equalsType( ${this.type1.toPiString()}, ${this.type2.toPiString()} ) = ${this.value}`;
    }
}

export class ConformsTypeRule extends PiTyperRule {
    type1: PiTypeValue;
    type2: PiTypeValue;
    value: boolean = false;

    toPiString(): string {
        return `@typecheck conformsTo( ${this.type1?.toPiString()}, ${this.type2?.toPiString()} ) = ${this.value}`;
    }
}

export class PiTypeValue {
    typeProperty: PiLangAppliedFeatureExp;
    allTypes: boolean;
    enumRef: PiLangEnumExp;

    toPiString(): string {
        // if (this.isAType) return "@aType" + this.typeProperty? this.typeProperty.toPiString() : "";
        if (this.allTypes) return "@anyType" + (!!this.typeProperty? "." + this.typeProperty.toPiString() : "");
        if (this.enumRef) return this.enumRef.toPiString();
    }
}

export abstract class PiCalculation {
    toPiString() : string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'PiTyperDefLang.PiCalculation'";
    }
}

export class PropertyCalculation extends PiCalculation {
    property: PiLangExp;

    toPiString(): string {
        return this.property.toPiString();
    }
}
export class TypeOfCalculation extends PiCalculation {
    type: PiLangExp;

    toPiString(): string {
        return `typeOf( ${this.type.toPiString()} )`;
    }
}

export class CommonSuperTypeCalculation extends PiCalculation {
    type1: PiLangExp;
    type2: PiLangExp;

    toPiString(): string {
        return `commonSuperType( ${this.type1.toPiString()}, ${this.type2.toPiString()} )`;
    }
}
export class IsTypeRef {
    appliedFeature: PiLangExp;

    toPiString(): string {
        return `@isType.${this.appliedFeature.toPiString()}`; 
    }
}
export class AllTypesRef {

    toPiString(): string {
        return `@all`; 
    }
}
