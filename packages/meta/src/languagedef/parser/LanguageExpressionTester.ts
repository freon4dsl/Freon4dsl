import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";
import { PiLangExp } from "../../languagedef/metalanguage/PiLangExpressions";
import { ParseLocation } from "../../utils";

export class LanguageExpressionTester {
    location: ParseLocation;
    languageName: string;
    conceptExps: TestExpressionsForConcept[] = [];
}

export class TestExpressionsForConcept {
    location: ParseLocation;
    conceptRef: PiLangConceptReference;
    exps: PiLangExp[] = [];
}
