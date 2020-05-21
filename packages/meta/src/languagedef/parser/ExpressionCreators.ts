import { LanguageExpressionTester, TestExpressionsForConcept } from "./LanguageExpressionTester";
import {
    PiLangSelfExp,
    PiLangAppliedFeatureExp,
    PiLangExp,
    PiLangFunctionCallExp,
    PiInstanceExp,
    PiLangConceptExp, PiLangSimpleExp
} from "../../languagedef/metalanguage/PiLangExpressions";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { Names } from "../../utils";
import { PiClassifier } from "../metalanguage/PiLanguage";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { PiElementReference } from "../metalanguage/PiElementReference";

const LOGGER = new PiLogger("PiLanguageExpressionCreator").mute();

export function createTest(data: Partial<LanguageExpressionTester>): LanguageExpressionTester {
    LOGGER.log("createTest");
    const result = new LanguageExpressionTester();
    if (!!data.languageName) {
        result.languageName = data.languageName;
    }
    if (!!data.conceptExps) {
        result.conceptExps = data.conceptExps;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createConceptExps(data: Partial<TestExpressionsForConcept>): TestExpressionsForConcept {
    LOGGER.log("createConceptExps");
    const result = new TestExpressionsForConcept();
    result.name = data.conceptRef.name + "ExpressionSet";
    if (!!data.conceptRef) {
        result.conceptRef = data.conceptRef;
        result.conceptRef.owner = result;
    }
    if (!!data.exps) {
        result.exps = data.exps;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createConceptReference(data: Partial<PiElementReference<PiClassifier>>): PiElementReference<PiClassifier> {
    LOGGER.log("createConceptReference " + data.name);
    const result = PiElementReference.createNamed<PiClassifier>(data.name, "PiClassifier");
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createExpression(data: Partial<PiLangExp>): PiLangExp {
    let result: PiLangExp;
    if (!!data.sourceName) {
        if (data.sourceName === Names.nameForSelf) {
            // cannot use PiLangSelfExp.create() because referedElement is not yet known
            result = new PiLangSelfExp();
            LOGGER.log("createSelfExpression");
            result.sourceName = data.sourceName;
        } else {
            result = new PiLangConceptExp();
            LOGGER.log("createConceptExpression");
            result.sourceName = data.sourceName;
        }
    }
    if (!!data.appliedfeature) {
        result.appliedfeature = data.appliedfeature;
        result.appliedfeature.sourceExp = result;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createAppliedFeatureExp(data: Partial<PiLangAppliedFeatureExp>): PiLangAppliedFeatureExp {
    LOGGER.log("createAppliedFeatureExp");
    // cannot use PiLangAppliedFeatureExp.create because the owner and referred element are not known here
    const result = new PiLangAppliedFeatureExp();

    if (!!data.sourceName) {
        result.sourceName = data.sourceName;
    }
    if (!!data.appliedfeature) {
        result.appliedfeature = data.appliedfeature;
        result.appliedfeature.sourceExp = result;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createInstanceExp(data: Partial<PiInstanceExp>): PiInstanceExp {
    LOGGER.log("createInstanceExp");
    const result: PiInstanceExp = new PiInstanceExp();
    if (!!data.sourceName) {
        result.sourceName = data.sourceName;
    }
    if (!!data.instanceName) {
        result.instanceName = data.instanceName;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createFunctionCall(data: Partial<PiLangFunctionCallExp>): PiLangFunctionCallExp {
    LOGGER.log("createFunctionCall");
    const result: PiLangFunctionCallExp = new PiLangFunctionCallExp();
    if (!!data.sourceName) {
        result.sourceName = data.sourceName;
    }
    if (!!data.appliedfeature) {
        result.appliedfeature = data.appliedfeature;
        result.appliedfeature.sourceExp = result;
    }
    if (!!data.actualparams) {
        result.actualparams = data.actualparams;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createSimpleExpression(data: Partial<PiLangSimpleExp>): PiLangSimpleExp {
    LOGGER.log("createSimpleExpression");
    const result: PiLangSimpleExp = new PiLangSimpleExp();
    // when the normal check is present, a value of 0 will not be passed to result
    // if (!!data.value) {
        result.value = data.value;
    // }
    return result;
}
