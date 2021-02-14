import { PiLangExp } from "../../languagedef/metalanguage/PiLangExpressions";
// import { ParseLocation } from "../../utils";
import { PiConcept, PiLanguage } from "../metalanguage";
import { PiLangElement } from "../metalanguage/PiLanguage";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { PiElementReference} from "../../languagedef/metalanguage/PiElementReference";

export class LanguageExpressionTester extends  PiLangElement {
    // location: ParseLocation;
    languageName: string;
    language: PiLanguage;
    conceptExps: TestExpressionsForConcept[] = [];
}

export class TestExpressionsForConcept extends  PiLangElement {
    // location: ParseLocation;
    conceptRef: PiElementReference<PiConcept>;
    language: PiLanguage;
    exps: PiLangExp[] = [];
}
