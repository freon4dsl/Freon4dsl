import {
    FreMetaLangElement,
    FreMetaInstance,
    FreMetaLanguage, FreMetaClassifier, FreMetaProperty, FreMetaPrimitiveType, FreMetaConcept
} from '../../languagedef/metalanguage/index.js';
import { MetaElementReference } from '../../languagedef/metalanguage/index.js';

// Some properties of the classes defined here are marked @ts-ignore to avoid the error:
// TS2564: ... has no initializer and is not definitely assigned in the constructor.
// These properties need to be undefined during parsing and checking. After the checking process
// has been executed without errors, we can assume that these properties are initialized.

export abstract class FreLangExpNew extends FreMetaLangElement {
    // @ts-ignore
    language: FreMetaLanguage; // the language for which this expression is defined

    toFreString(): string {
        return 'SHOULD BE IMPLEMENTED BY SUBCLASSES OF "FreLangExpressions.FreLangExpNew"';
    }

    toErrorString(): string {
        // should be overridden by all subclasses
        return '';
    }

    getResultingClassifier(): FreMetaClassifier | undefined {
        // should be overridden by all subclasses
        return undefined;
    }

    getLastExpression(): FreLangExpNew {
        // should be overridden by all subclasses that can have an applied expression
        return this;
    }
}

export abstract class FreVarOrFunctionExp extends FreLangExpNew {
    // @ts-ignore
    name: string;
    applied: FreAppliedExp | undefined;
    // @ts-ignore
    $referredClassifier: MetaElementReference<FreMetaClassifier>;

    get referredClassifier(): FreMetaClassifier {
        return this.$referredClassifier?.referred;
    }

    set referredClassifier(p: FreMetaClassifier) {
        this.$referredClassifier = MetaElementReference.create<FreMetaClassifier>(p, "FreMetaClassifier");
        this.$referredClassifier.owner = this;
    }

    // @ts-ignore
    $referredProperty: MetaElementReference<FreMetaProperty>;

    get referredProperty(): FreMetaProperty {
        return this.$referredProperty?.referred;
    }

    set referredProperty(p: FreMetaProperty) {
        this.$referredProperty = MetaElementReference.create<FreMetaProperty>(p, "FreProperty");
        this.$referredProperty.owner = this;
    }

    toErrorString(): string {
        // should be overridden by all subclasses
        return '';
    }

    getLocalClassifier(): FreMetaClassifier | undefined {
        // should be overridden by all subclasses
        return undefined;
    }

    getLastExpression(): FreLangExpNew {
        // should be overridden by all subclasses
        if (this.applied) {
            return this.applied.getLastExpression();
        } else {
            return this;
        }
    }
}

export class FreVarExp extends FreVarOrFunctionExp {
    getLocalClassifier(): FreMetaClassifier | undefined {
        if (this.$referredProperty) {
            return this.referredProperty?.typeReference?.referred;
        } else {
            return this.referredClassifier;
        }
    }

    getResultingClassifier(): FreMetaClassifier | undefined {
        if (this.applied) {
            return this.applied.getResultingClassifier();
        } else {
            return this.getLocalClassifier();
        }
    }

    toFreString(): string {
        return this.name  + (this.applied ? this.applied.toFreString() : '');
    }

    toErrorString(): string {
        return this.name;
    }
}

export class FreFunctionExp extends FreVarOrFunctionExp {
    // @ts-ignore
    param: FreLangExpNew | undefined;
    possibleClassifiers: MetaElementReference<FreMetaClassifier>[] = [];

    toFreString(): string {
        return this.name + '(' + (this.param ? this.param.toFreString() : '') + ')' + (this.applied ? this.applied.toFreString() : '');
    }

    toErrorString(): string {
        return this.name + '(' + (this.param ? this.param.toFreString() : '') + ')';
    }

    getLocalClassifier(): FreMetaClassifier | undefined {
        return this.referredClassifier;
    }

    getResultingClassifier(): FreMetaClassifier | undefined {
        if (this.applied) {
            return this.applied.getResultingClassifier();
        } else {
            return this.getLocalClassifier();
        }
    }
}

export class FreAppliedExp extends FreLangExpNew {
    // @ts-ignore
    exp: FreVarOrFunctionExp;
    // @ts-ignore
    previous: FreVarOrFunctionExp;

    get referredProperty(): FreMetaProperty {
        return this.exp.referredProperty;
    }

    toFreString(): string {
        return '.' + this.exp?.toFreString();
    }

    toErrorString(): string {
        return this.previous.toErrorString();
    }

    getResultingClassifier(): FreMetaClassifier | undefined {
        return this.exp.getResultingClassifier();
    }

    getLastExpression(): FreLangExpNew {
        return this.exp.getLastExpression();
    }
}

export class FreLimitedInstanceExp extends FreLangExpNew {
    conceptName: string = ''; // should be the name of a limited concept
    instanceName: string = ''; // should be the name of one of the predefined instances of 'sourceName'
    // @ts-ignore
    $referredInstance: MetaElementReference<FreMetaInstance>;
    // @ts-ignore
    $referredClassifier: MetaElementReference<FreMetaConcept>;

    get referredInstance(): FreMetaInstance {
        return this.$referredInstance?.referred;
    }

    set referredInstance(p: FreMetaInstance) {
        this.$referredInstance = MetaElementReference.create<FreMetaInstance>(p, "FreMetaInstance");
        this.$referredInstance.owner = this;
    }

    get referredClassifier(): FreMetaConcept {
        return this.$referredClassifier?.referred;
    }

    set referredClassifier(p: FreMetaConcept) {
        this.$referredClassifier = MetaElementReference.create<FreMetaConcept>(p, "FreMetaConcept");
        this.$referredClassifier.owner = this;
    }

    toFreString(): string {
        return '#' + this.conceptName + ':' + this.instanceName;
    }

    getResultingClassifier(): FreMetaClassifier | undefined {
        return this.referredClassifier;
    }
}

export class FreLangSimpleExp extends FreLangExpNew {
    // @ts-ignore
    value: number;

    toFreString(): string {
        return this.value?.toString();
    }

    getResultingClassifier(): FreMetaClassifier | undefined {
        return FreMetaPrimitiveType.number;
    }
}
