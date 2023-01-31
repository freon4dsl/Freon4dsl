import { FreLangExp } from "../metalanguage/FreLangExpressions";
// import { ParseLocation } from "../../utils";
import { FreConcept, FreLanguage } from "../metalanguage";
import { FreLangElement } from "../metalanguage/FreLanguage";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { MetaElementReference} from "../metalanguage/MetaElementReference";

export class LanguageExpressionTester extends  FreLangElement {
    // location: ParseLocation;
    languageName: string;
    language: FreLanguage;
    conceptExps: TestExpressionsForConcept[] = [];
}

export class TestExpressionsForConcept extends  FreLangElement {
    // location: ParseLocation;
    conceptRef: MetaElementReference<FreConcept>;
    language: FreLanguage;
    exps: FreLangExp[] = [];
}
