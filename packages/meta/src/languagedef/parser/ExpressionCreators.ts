import { LanguageExpressionTester, TestExpressionsForConcept } from "./LanguageExpressionTester";
import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";
import { PiLangThisExp, PiLangAppliedFeatureExp, PiLangEnumExp, PiLangExp, PiLangConceptExp, PiLangFunctionCallExp } from "../../languagedef/metalanguage/PiLangExpressions";
import { PiLogger } from "../../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("PiLanguageExpressionCreator"); //.mute();

export function createTest(data: Partial<LanguageExpressionTester>): LanguageExpressionTester {
    LOGGER.log("createTest");
    const result = new LanguageExpressionTester();
    if (!!data.languageName) { result.languageName = data.languageName; }
    if (!!data.conceptExps) { result.conceptExps = data.conceptExps; }
    if (!!data.location) { result.location = data.location; }
    return result;
}

export function createConceptExps(data: Partial<TestExpressionsForConcept>): TestExpressionsForConcept {
    LOGGER.log("createConceptExps");
    const result = new TestExpressionsForConcept();
    if (!!data.conceptRef) { result.conceptRef = data.conceptRef; }
    if (!!data.exps) { result.exps = data.exps; }
    if (!!data.location) { result.location = data.location; }
    return result;
}

export function createConceptReference(data: Partial<PiLangConceptReference>): PiLangConceptReference {
    LOGGER.log("createConceptReference " + data.name);
    const result = new PiLangConceptReference();
    if(!!data.name) { result.name = data.name; }
    if (!!data.location) { result.location = data.location; }
    return result;
}

export function createExpression(data: Partial<PiLangExp>) : PiLangExp {
    LOGGER.log("createExpression");
    let result : PiLangExp;
    if (!!data.sourceName ) {
        if ( data.sourceName === "this") {
            result = new PiLangThisExp();
            LOGGER.log("createThisExpression");
            result.sourceName = data.sourceName;
        } else {
            result = new PiLangConceptExp();
            LOGGER.log("createConceptExpression");
            result.referedElement = new PiLangConceptReference();
            result.referedElement.name = data.sourceName;
            result.sourceName = data.sourceName;
        }
    }
    if (!!data.appliedfeature) {
        result.appliedfeature = data.appliedfeature;
    }
    if (!!data.location) { result.location = data.location; }
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
    }
    if (!!data.location) { result.location = data.location; }
    return result;
}

export function createEnumReference(data: Partial<PiLangEnumExp>) : PiLangEnumExp {
    LOGGER.log("createEnumReference");
    const result : PiLangEnumExp = new PiLangEnumExp();
    if (!!data.sourceName) {
        result.sourceName = data.sourceName;
    }
    if (!!data.appliedfeature) {
        result.appliedfeature = data.appliedfeature;
    }
    if (!!data.location) { result.location = data.location; }
    return result;
}

export function createFunctionCall(data: Partial<PiLangFunctionCallExp>) : PiLangFunctionCallExp {
    LOGGER.log("createFunctionCall");
    const result : PiLangFunctionCallExp = new PiLangFunctionCallExp();
    if (!!data.sourceName) {
        result.sourceName = data.sourceName;
    }
    if (!!data.appliedfeature) {
        result.appliedfeature = data.appliedfeature;
    }
    if (!!data.actualparams) {
        result.actualparams = data.actualparams;
    }
    if (!!data.location) { result.location = data.location; }
    return result;
}
