import {
    FreMetaLangElement,
    FreMetaClassifier,
    FreMetaFunction,
    FreMetaInstance,
    FreMetaLanguage,
    FreMetaProperty,
} from "./internal.js";
import { Names } from "../../utils/index.js";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { MetaElementReference } from "./index.js";

/** This module contains classes that implement Expressions over the FreLanguage structure.
 *  There are five types of Expressions:
 *  1. Simple expression: a simple value, currently only numbers
 *  2. Instance expression: an expression that refers to a predefined instance of a limited concept, e.g. DemoAttributeType:Integer
 *  3. Functions expression: an expression that refers to one of the functions that may be used in the typer and/or validator, like 'conformsto'
 *  4. Concept expression: an expression that refers to a keyword, currently only 'owner'
 *  5. Self expression: an expression that refers to a property of a classifier, like 'self.age'
 */

// Some properties of the classes defined here are marked @ts-ignore to avoid the error:
// TS2564: ... has no initializer and is not definitely assigned in the constructor.
// These properties need to be undefined during parsing and checking. After the checking process
// has been executed without errors, we can assume that these properties are initialized.

export abstract class FreLangExp extends FreMetaLangElement {
    sourceName: string = ""; // either the 'XXX' in "XXX.yyy" or 'yyy' in "yyy"
    // @ts-ignore
    appliedfeature: FreLangAppliedFeatureExp; // either the 'yyy' in "XXX.yyy" or 'null' in "yyy"
    // @ts-ignore
    $referredElement: MetaElementReference<FreMetaLangElement>; // refers to the element called 'sourceName'
    // @ts-ignore
    language: FreMetaLanguage; // the language for which this expression is defined

    // returns the property to which the complete expression refers, i.e. the element to which the 'd' in 'a.b.c.d' refers.
    findRefOfLastAppliedFeature(): FreMetaProperty | undefined {
        if (!!this.language) {
            if (this.appliedfeature !== undefined) {
                // console.log(" last of: " + this.appliedfeature.sourceName);
                return this.appliedfeature.findRefOfLastAppliedFeature();
            } else {
                const found: FreMetaLangElement = this.$referredElement?.referred;
                // console.log("found reference: " + found?.name + " of type " + typeof found);
                if (found instanceof FreMetaProperty) {
                    return found;
                }
            }
        } else {
            throw Error("Applied feature cannot be found because language is not set.");
        }
        return undefined;
    }

    toFreString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'FreLangExpressions.FreLangExp'";
    }
}

export class FreLangSimpleExp extends FreLangExp {
    // @ts-ignore
    value: number;

    findRefOfLastAppliedFeature(): FreMetaProperty | undefined {
        return undefined;
    }

    toFreString(): string {
        return this.value?.toString();
    }
}

export class FreLangSelfExp extends FreLangExp {
    static create(referred: FreMetaClassifier): FreLangSelfExp {
        const result = new FreLangSelfExp();
        result.$referredElement = MetaElementReference.create<FreMetaClassifier>(referred, "FreClassifier");
        result.$referredElement.owner = result;
        result.sourceName = Names.nameForSelf;
        return result;
    }

    // @ts-ignore
    $referredElement: MetaElementReference<FreMetaClassifier>; // is not needed, can be determined based on its parent

    toFreString(): string {
        if (!!this.sourceName && this.sourceName !== 'self') {
            return this.sourceName + (this.appliedfeature ? "." + this.appliedfeature.toFreString() : "");
        } else {
            // e.g. in isunique validation rules
            return this.appliedfeature ? this.appliedfeature.toFreString() : "";
        }
    }
}

export class FreInstanceExp extends FreLangExp {
    // sourceName should be the name of a limited concept
    instanceName: string = ""; // should be the name of one of the predefined instances of 'sourceName'
    // @ts-ignore
    $referredElement: MetaElementReference<FreMetaInstance>;

    toFreString(): string {
        return this.sourceName + ":" + this.instanceName;
    }
}

export class FreLangConceptExp extends FreLangExp {
    // @ts-ignore
    $referredElement: MetaElementReference<FreMetaClassifier>;

    toFreString(): string {
        return this.sourceName + (this.appliedfeature ? "." + this.appliedfeature.toFreString() : "");
    }
}

export class FreLangAppliedFeatureExp extends FreLangExp {
    static create(owner: FreLangExp, name: string, referred: FreMetaProperty): FreLangAppliedFeatureExp {
        const result = new FreLangAppliedFeatureExp();
        result.referredElement = referred;
        result.sourceName = name;
        result.sourceExp = owner;
        return result;
    }

    // @ts-ignore
    sourceExp: FreLangExp;
    // @ts-ignore
    $referredElement: MetaElementReference<FreMetaProperty>;

    get referredElement(): FreMetaProperty {
        return this.$referredElement?.referred;
    }

    set referredElement(p: FreMetaProperty) {
        this.$referredElement = MetaElementReference.create<FreMetaProperty>(p, "FreProperty");
        this.$referredElement.owner = this;
    }

    get reference(): MetaElementReference<FreMetaProperty> {
        return this.$referredElement;
    }

    set reference(p: MetaElementReference<FreMetaProperty>) {
        this.$referredElement = p;
        this.$referredElement.owner = this;
    }

    toFreString(): string {
        return this.sourceName + (this.appliedfeature ? "." + this.appliedfeature.toFreString() : "");
    }

    findRefOfLastAppliedFeature(): FreMetaProperty {
        if (this.appliedfeature !== undefined) {
            // console.log(" last of: " + this.appliedfeature.sourceName);
            return this.appliedfeature.findRefOfLastAppliedFeature();
        } else {
            // console.log("found reference: " + this.referredElement?.referred?.name);
            return this.$referredElement?.referred;
        }
    }
}

export class FreLangFunctionCallExp extends FreLangExp {
    // sourceName: string = ''; 			// only used in validator for 'conformsTo' and 'equalsType'
    actualparams: FreLangExp[] = [];
    // @ts-ignore
    returnValue: boolean;
    // @ts-ignore
    $referredElement: MetaElementReference<FreMetaFunction>;

    toFreString(): string {
        let actualPars: string = "( ";
        if (!!this.actualparams) {
            for (const actual of this.actualparams) {
                actualPars = actualPars.concat(actual.toFreString());
                if (this.actualparams.indexOf(actual) !== this.actualparams.length - 1) {
                    actualPars = actualPars.concat(", ");
                }
            }
        }
        actualPars = actualPars.concat(` )`);
        return this.sourceName + actualPars + (this.appliedfeature ? "." + this.appliedfeature.toFreString() : "");
    }
}
