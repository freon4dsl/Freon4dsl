import { PiLangExp } from "../../languagedef/metalanguage/PiLangExpressions";
import { ParseLocation } from "../../utils";
import { PiConcept, PiElementReference, PiLanguageUnit } from "../metalanguage";
import { PiLangElement } from "../metalanguage/PiLangElement";

export class LanguageExpressionTester extends  PiLangElement {
    // location: ParseLocation;
    languageName: string;
    language: PiLanguageUnit;
    conceptExps: TestExpressionsForConcept[] = [];
}

export class TestExpressionsForConcept extends  PiLangElement {
    // location: ParseLocation;
    conceptRef: PiElementReference<PiConcept>;
    language: PiLanguageUnit;
    exps: PiLangExp[] = [];
}
