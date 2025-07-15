import { FreLangExp } from "../metalanguage/FreLangExpressions.js";
import {
    FreMetaLanguage,
    FreMetaLangElement,
    MetaElementReference,
    FreMetaClassifier
} from '../../languagedef/metalanguage/index.js';

// These classes are helpers to test the parsing and checking of expressions over the metamodel.
// They are not used in the actual generation.

// Some properties of the classes defined here are marked @ts-ignore to avoid the error:
// TS2564: ... has no initializer and is not definitely assigned in the constructor.
// These properties need to be undefined during parsing and checking. After the checking process
// has been executed without errors, we can assume that these properties are initialized.

export class LanguageExpressionTester extends FreMetaLangElement {
    languageName: string = "";
    // @ts-ignore
    language: FreMetaLanguage;
    conceptExps: TestExpressionsForConcept[] = [];

    toFreString(): string {
        return this.conceptExps.map(exp => exp.toFreString()).join("\n");
    }
}

export class TestExpressionsForConcept extends FreMetaLangElement {
    // @ts-ignore
    classifierRef: MetaElementReference<FreMetaClassifier>;
    // @ts-ignore
    language: FreMetaLanguage;
    exps: FreLangExp[] = [];

    toFreString(): string {
        return this.classifierRef.name + ' {\n\t' + this.exps.map(exp => exp.toFreString()).join("\n\t") + '\n}';
    }
}
