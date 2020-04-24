import { PiLangExp } from "../../languagedef/metalanguage/PiLangExpressions";
import { ParseLocation } from "../../utils";
import { PiConcept, PiElementReference } from "../metalanguage";

export class LanguageExpressionTester {
    location: ParseLocation;
    languageName: string;
    conceptExps: TestExpressionsForConcept[] = [];
}

export class TestExpressionsForConcept {
    location: ParseLocation;
    conceptRef: PiElementReference<PiConcept>;
    exps: PiLangExp[] = [];
}
