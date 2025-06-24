import { FreLangExp, FreMetaConcept, FreMetaLanguage, FreMetaLangElement, MetaElementReference  } from "../metalanguage/index.js";

export class LanguageExpressionTester extends FreMetaLangElement {
    // location: ParseLocation;
    languageName: string = "";
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
