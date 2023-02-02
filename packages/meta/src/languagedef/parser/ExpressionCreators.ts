import { LanguageExpressionTester, TestExpressionsForConcept } from "./LanguageExpressionTester";
import {
    FreLangSelfExp,
    FreLangAppliedFeatureExp,
    FreLangExp,
    FreLangFunctionCallExp,
    FreInstanceExp,
    FreLangConceptExp, FreLangSimpleExp
} from "../metalanguage/FreLangExpressions";
import { MetaLogger } from "../../utils/MetaLogger";
import { Names } from "../../utils";
import { FreClassifier } from "../metalanguage/FreLanguage";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { MetaElementReference } from "../metalanguage/MetaElementReference";

const LOGGER = new MetaLogger("FreLanguageExpressionCreator").mute();

let currentFileName: string = "SOME_FILENAME";
export function setCurrentFileName(newName: string) {
    currentFileName = newName;
}

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
        result.location.filename = currentFileName;
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
        result.location.filename = currentFileName;
    }
    return result;
}

export function createClassifierReference(data: Partial<MetaElementReference<FreClassifier>>): MetaElementReference<FreClassifier> {
    LOGGER.log("createClassifierReference " + data.name);
    const result = MetaElementReference.create<FreClassifier>(data.name, "FreClassifier");
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createExpression(data: Partial<FreLangExp>): FreLangExp {
    let result: FreLangExp;
    if (!!data.sourceName) {
        if (data.sourceName === Names.nameForSelf) {
            // cannot use FreLangSelfExp.create() because referredElement is not yet known
            result = new FreLangSelfExp();
            LOGGER.log("createSelfExpression");
            result.sourceName = data.sourceName;
        } else {
            result = new FreLangConceptExp();
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
        result.location.filename = currentFileName;
    }
    return result;
}

export function createAppliedFeatureExp(data: Partial<FreLangAppliedFeatureExp>): FreLangAppliedFeatureExp {
    LOGGER.log("createAppliedFeatureExp");
    // cannot use FreLangAppliedFeatureExp.create because the owner and referred element are not known here
    const result = new FreLangAppliedFeatureExp();

    if (!!data.sourceName) {
        result.sourceName = data.sourceName;
    }
    if (!!data.appliedfeature) {
        result.appliedfeature = data.appliedfeature;
        result.appliedfeature.sourceExp = result;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createInstanceExp(data: Partial<FreInstanceExp>): FreInstanceExp {
    LOGGER.log("createInstanceExp");
    const result: FreInstanceExp = new FreInstanceExp();
    if (!!data.sourceName) {
        result.sourceName = data.sourceName;
    }
    if (!!data.instanceName) {
        result.instanceName = data.instanceName;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createFunctionCall(data: Partial<FreLangFunctionCallExp>): FreLangFunctionCallExp {
    LOGGER.log("createFunctionCall");
    const result: FreLangFunctionCallExp = new FreLangFunctionCallExp();
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
        result.location.filename = currentFileName;
    }
    return result;
}

export function createSimpleExpression(data: Partial<FreLangSimpleExp>): FreLangSimpleExp {
    LOGGER.log("createSimpleExpression");
    const result: FreLangSimpleExp = new FreLangSimpleExp();
    // when the normal check is present, a value of 0 will not be passed to result
    // if (!!data.value) {
    result.value = data.value;
    // }
    return result;
}
