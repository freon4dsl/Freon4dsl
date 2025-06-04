import {
    FreMetaLangElement,
    FreMetaInstance,
    FreMetaLanguage
} from "../../languagedef/metalanguage/index.js";
import { MetaElementReference } from "../../languagedef/metalanguage/index.js";


export abstract class FreLangExpNew extends FreMetaLangElement {
    // @ts-ignore
    language: FreMetaLanguage; // the language for which this expression is defined

    toFreString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'FreLangExpressions.FreLangExpNew'";
    }
}

export abstract class FreComposedExpression extends FreLangExpNew {
    // @ts-ignore
    name: string;
    // @ts-ignore
    param: FreLangExpNew | undefined;
    // @ts-ignore
    applied: FreAppliedExp | undefined;
}

export class FreSelfExp extends FreComposedExpression {
    // no name
    // no param

    toFreString(): string {
        return "self" + (this.applied ? this.applied.toFreString() : '');
    }
}

export class FrePropertyExp extends FreComposedExpression {
    // no param

    toFreString(): string {
        return this.name  + (this.applied ? this.applied.toFreString() : '');
    }
}

export class FreFunctionExp extends FreComposedExpression {

    toFreString(): string {
        return this.name + '(' + (this.param ? this.param.toFreString() : '') + ')' + (this.applied ? this.applied.toFreString() : '');
    }
}

export class FreAppliedExp extends FreLangExpNew {
    // @ts-ignore
    exp: FreLangExpNew;

    toFreString(): string {
        return "." + this.exp?.toFreString();
    }
}

export class FreLimitedInstanceExp extends FreLangExpNew {
    conceptName: string = ''; // should be the name of a limited concept
    instanceName: string = ""; // should be the name of one of the predefined instances of 'sourceName'
    // @ts-ignore
    $referredElement: MetaElementReference<FreMetaInstance>;

    toFreString(): string {
        return '#' + this.conceptName + ":" + this.instanceName;
    }
}

export class FreLangSimpleExp extends FreLangExpNew {
    // @ts-ignore
    value: number;

    toFreString(): string {
        return this.value?.toString();
    }
}
