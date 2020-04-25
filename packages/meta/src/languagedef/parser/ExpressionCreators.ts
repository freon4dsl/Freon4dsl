import { LanguageExpressionTester, TestExpressionsForConcept } from "./LanguageExpressionTester";
import {
    PiLangSelfExp,
    PiLangAppliedFeatureExp,
    PiLangExp,
    PiLangFunctionCallExp,
    PiInstanceExp,
    PiLangConceptExp
} from "../../languagedef/metalanguage/PiLangExpressions";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiClassifier } from "../metalanguage/PiLanguage";
import { PiElementReference } from "../metalanguage/PiElementReference";

const LOGGER = new PiLogger("PiLanguageExpressionCreator").mute();
export const nameForSelf = "self";

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
        if (data.sourceName === nameForSelf) {
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
    if (!!data.appliedfeature) {
        result.appliedfeature = data.appliedfeature;
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
    }
    if (!!data.actualparams) {
        result.actualparams = data.actualparams;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}
