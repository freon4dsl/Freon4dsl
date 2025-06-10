import {
    FreMetaLangElement,
    FreMetaInstance,
    FreMetaLanguage,
    FreMetaClassifier,
    FreMetaProperty,
    FreMetaPrimitiveType,
    FreMetaConcept
} from '../../languagedef/metalanguage/index.js';

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
    applied: FreVarOrFunctionExp | undefined;
    previous: FreVarOrFunctionExp | undefined;
    // @ts-ignore
    $referredClassifier: FreMetaClassifier;

    get referredClassifier(): FreMetaClassifier {
        return this.$referredClassifier;
    }

    set referredClassifier(p: FreMetaClassifier) {
        this.$referredClassifier = p;
        // this.$referredClassifier.owner = this;
    }

    // @ts-ignore
    $referredProperty: FreMetaProperty;

    get referredProperty(): FreMetaProperty {
        return this.$referredProperty;
    }

    set referredProperty(p: FreMetaProperty) {
        this.$referredProperty = p;
        // this.$referredProperty.owner = this;
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
        return this.name  + (this.applied ? '.' + this.applied.toFreString() : '');
    }

    toErrorString(): string {
        return this.name;
    }
}

export class FreFunctionExp extends FreVarOrFunctionExp {
    // @ts-ignore
    param: FreLangExpNew | undefined;
    possibleClassifiers: FreMetaClassifier[] = [];

    toFreString(): string {
        return this.name + '(' + (this.param ? this.param.toFreString() : '') + ')' + (this.applied ? '.' + this.applied.toFreString() : '');
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

export class FreLimitedInstanceExp extends FreLangExpNew {
    conceptName: string = ''; // should be the name of a limited concept
    instanceName: string = ''; // should be the name of one of the predefined instances of 'sourceName'
    // @ts-ignore
    $referredInstance: FreMetaInstance;
    // @ts-ignore
    $referredClassifier: FreMetaConcept;

    get referredInstance(): FreMetaInstance {
        return this.$referredInstance;
    }

    set referredInstance(p: FreMetaInstance) {
        this.$referredInstance = p;
        // this.$referredInstance.owner = this;
    }

    get referredClassifier(): FreMetaConcept {
        return this.$referredClassifier;
    }

    set referredClassifier(p: FreMetaConcept) {
        this.$referredClassifier = p;
        // this.$referredClassifier.owner = this;
    }

    toFreString(): string {
        return '#' + this.conceptName + ':' + this.instanceName;
    }

    getResultingClassifier(): FreMetaClassifier | undefined {
        return this.referredClassifier;
    }
}

export class FreLangSimpleExpNew extends FreLangExpNew {
    // @ts-ignore
    value: number;

    toFreString(): string {
        return this.value?.toString();
    }

    getResultingClassifier(): FreMetaClassifier | undefined {
        return FreMetaPrimitiveType.number;
    }
}

export class ClassifierReference extends FreMetaLangElement {
    // @ts-ignore
    name: string;
    // @ts-ignore
    referred: FreMetaClassifier;
}
