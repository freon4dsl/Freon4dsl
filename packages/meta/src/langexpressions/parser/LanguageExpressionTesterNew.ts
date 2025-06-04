import { FreLangExpNew } from "../metalanguage/FreLangExpressions.js";
// import { ParseLocation } from "../../utils";
import { FreMetaConcept, FreMetaLanguage } from "../../languagedef/metalanguage/index.js";
import { FreMetaLangElement } from "../../languagedef/metalanguage/FreMetaLanguage.js";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { MetaElementReference } from "../../languagedef/metalanguage/MetaElementReference.js";

export class LanguageExpressionTesterNew extends FreMetaLangElement {
    // location: ParseLocation;
    languageName: string = "";
    // @ts-ignore
    language: FreMetaLanguage;
    conceptExps: TestExpressionsForConcept[] = [];

    toFreString(): string {
        return this.conceptExps.map(exp => exp.toFreString()).join("\n");
    }
}

export class TestExpressionsForConcept extends FreMetaLangElement {
    // location: ParseLocation;
    // @ts-ignore
    conceptRef: MetaElementReference<FreMetaConcept>;
    // @ts-ignore
    language: FreMetaLanguage;
    exps: FreLangExpNew[] = [];

    toFreString(): string {
        return this.conceptRef.name + ' {\n\t' + this.exps.map(exp => exp.toFreString()).join("\n\t") + '\n}';
    }
}
