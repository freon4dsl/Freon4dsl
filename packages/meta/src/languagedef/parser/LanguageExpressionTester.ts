import { FreLangExp } from "../metalanguage/FreLangExpressions";
// import { ParseLocation } from "../../utils";
import { FreMetaConcept, FreMetaLanguage } from "../metalanguage";
import { FreMetaLangElement } from "../metalanguage/FreMetaLanguage";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { MetaElementReference } from "../metalanguage/MetaElementReference";

export class LanguageExpressionTester extends FreMetaLangElement {
    // location: ParseLocation;
    languageName: string = '';
    // @ts-ignore
    language: FreMetaLanguage;
    conceptExps: TestExpressionsForConcept[] = [];
}

export class TestExpressionsForConcept extends FreMetaLangElement {
    // location: ParseLocation;
    // @ts-ignore
    conceptRef: MetaElementReference<FreMetaConcept>;
    // @ts-ignore
    language: FreMetaLanguage;
    exps: FreLangExp[] = [];
}
