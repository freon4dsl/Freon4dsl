import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";
import { PiLangExp } from "../../languagedef/metalanguage/PiLangExpressions";

export class LanguageExpressionTester {
    languageName: string;
    conceptExps: TestExpressionsForConcept[] = [];
}

export class TestExpressionsForConcept {
    conceptRef: PiLangConceptReference;
    exps: PiLangExp[] = [];
}