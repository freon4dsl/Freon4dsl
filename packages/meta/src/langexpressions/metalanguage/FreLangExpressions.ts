/**
 * The classes that are defined here should replace the classes FreLangExp and its subclasses.
 *
 * Every class represents a certain expression over a metamodel as defined in an .ast file.
 */
import {
    FreMetaLangElement,
    FreMetaInstance,
    FreMetaLanguage,
    FreMetaClassifier,
    FreMetaProperty,
    FreMetaPrimitiveType,
    FreMetaConcept
} from '../../languagedef/metalanguage/index.js';
import { MetaFunctionNames } from '../../utils/no-dependencies/index.js';

// Some properties of the classes defined here are marked @ts-ignore to avoid the error:
// TS2564: ... has no initializer and is not definitely assigned in the constructor.
// These properties need to be undefined during parsing and checking. After the checking process
// has been executed without errors, we can assume that these properties are initialized.

export abstract class FreLangExp extends FreMetaLangElement {
    // @ts-ignore
    language: FreMetaLanguage; // the language for which this expression is defined

    /**
     * Returns a string that is equal to the input of the parser for this expression.
     */
    toFreString(): string {
        return 'SHOULD BE IMPLEMENTED BY SUBCLASSES OF "FreLangExpressions.FreLangExp"';
    }

    /**
     * Returns a 'local' string representation of the expression taht can be used in error messages.
     */
    toErrorString(): string {
        // should be overridden by all subclasses
        return '';
    }

    /**
     * Returns true if this expression refers to a property and that property is a 'part' (not a 'reference').
     * Also returns true if this expression is one of the functions 'owner', 'type, or 'if'.
     */
    getIsPart(): boolean {
        // only overridden by FreVarExp, it's result depends on the property it may refer to
        return false;
    }

    /**
     * Returns true if this expression refers to a property and that property is a list.
     */
    getIsList(): boolean {
        // only overridden by FreVarExp, it's result depends on the property it may refer to
        return false;
    }

    /**
     * Returns the type of the last of the applied expressions.
     */
    getResultingClassifier(): FreMetaClassifier | undefined {
        // should be overridden by all subclasses
        return undefined;
    }

    /**
     * Returns the last of the applied expressions.
     */
    getLastExpression(): FreLangExp {
        // should be overridden by all subclasses that can have an applied expression
        return this;
    }
}

export abstract class FreVarOrFunctionExp extends FreLangExp {
    // @ts-ignore
    name: string;
    applied: FreVarOrFunctionExp | undefined;
    previous: FreVarOrFunctionExp | undefined;
    // @ts-ignore
    $referredClassifier: FreMetaClassifier;
    // @ts-ignore
    $referredProperty: FreMetaProperty;

    get referredClassifier(): FreMetaClassifier {
        return this.$referredClassifier;
    }

    set referredClassifier(p: FreMetaClassifier) {
        this.$referredClassifier = p;
    }

    get referredProperty(): FreMetaProperty {
        return this.$referredProperty;
    }

    set referredProperty(p: FreMetaProperty) {
        this.$referredProperty = p;
    }

    toErrorString(): string {
        // should be overridden by all subclasses
        return '';
    }

    /**
     * Returns the type of this expression.
     */
    getLocalClassifier(): FreMetaClassifier | undefined {
        // should be overridden by all subclasses
        return undefined;
    }

    getLastExpression(): FreLangExp {
        if (this.applied) {
            return this.applied.getLastExpression();
        } else {
            return this;
        }
    }

    getResultingClassifier(): FreMetaClassifier | undefined {
        if (this.applied) {
            return this.applied.getResultingClassifier();
        } else {
            return this.getLocalClassifier();
        }
    }
}

/**
 * This class can represent three types of expressions:
 * (1) 'self', in which case the $referredClassifier is set by the checker to the classifier that represents 'self',
 * (2) a property, in which case the $referredProperty is set by the checker to the FreMetaProperty and the
 *      $referredClassifier is set to the classifier that owns the property,
 * (3) the name of a classifier, in which case the $referredClassifier is set to the FreMetaClassifier object with that name.
 */
export class FreVarExp extends FreVarOrFunctionExp {

    getIsPart(): boolean {
        if (this.$referredProperty) {
            return this.referredProperty?.isPart;
        }
        return true;
    }

    getLocalClassifier(): FreMetaClassifier | undefined {
        if (this.$referredProperty) {
            return this.referredProperty?.typeReference?.referred;
        } else {
            return this.referredClassifier;
        }
    }

    toFreString(): string {
        return this.name  + (this.applied ? '.' + this.applied.toFreString() : '');
    }

    toErrorString(): string {
        return this.name;
    }

    getIsList() {
        if (this.$referredProperty) {
            return this.referredProperty?.isList;
        }
        return true;
    }
}

/**
 * This class represents the call of nay of the predefined methods (see util/no-dependencies/MetaFunctionNames.ts).
 */
export class FreFunctionExp extends FreVarOrFunctionExp {
    // @ts-ignore
    param: FreLangExp | undefined;
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

    getIsPart(): boolean {
        // None of these functions result ina FreNodeReference object
        if (this.name === MetaFunctionNames.ownerFunc || this.name === MetaFunctionNames.ifFunc || this.name === MetaFunctionNames.typeFunc) {
            return true;
        }
        return false;
    }
}

/**
 * This class represents an expression that refers to an instance of a limited concept.
 */
export class FreLimitedInstanceExp extends FreLangExp {
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

/**
 * This class represents a simple expression, currently just a number.
 */
export class FreLangSimpleExp extends FreLangExp {
    // @ts-ignore
    value: number;

    toFreString(): string {
        return this.value?.toString();
    }

    getResultingClassifier(): FreMetaClassifier | undefined {
        return FreMetaPrimitiveType.number;
    }
}
