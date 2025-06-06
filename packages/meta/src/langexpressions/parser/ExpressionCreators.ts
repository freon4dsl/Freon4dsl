import {
    FreLangSimpleExp,
    FreLimitedInstanceExp,
    FreAppliedExp,
    FreVarOrFunctionExp,
    FreFunctionExp,
    FreVarExp
} from '../metalanguage/FreLangExpressionsNew.js';
import { MetaLogger } from "../../utils/MetaLogger.js";
import { FreMetaClassifier } from "../../languagedef/metalanguage/FreMetaLanguage.js";
import { MetaElementReference } from "../../languagedef/metalanguage/MetaElementReference.js";
import {
    LanguageExpressionTesterNew,
    TestExpressionsForConcept
} from './LanguageExpressionTesterNew.js';

const LOGGER = new MetaLogger("FreLanguageExpressionCreator").mute();

let currentFileName: string = "SOME_FILENAME";
export function setCurrentFileName(newName: string) {
    currentFileName = newName;
}

export function createTest(data: Partial<LanguageExpressionTesterNew>): LanguageExpressionTesterNew {
    LOGGER.log("createTest");
    const result = new LanguageExpressionTesterNew();
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
    LOGGER.log(result.toFreString())
    return result;
}

export function createClassifierExps(data: Partial<TestExpressionsForConcept>): TestExpressionsForConcept {
    LOGGER.log("createClassifierExps");
    const result = new TestExpressionsForConcept();
    result.name = data.classifierRef?.name + "ExpressionSet";
    if (!!data.classifierRef) {
        result.classifierRef = data.classifierRef;
        result.classifierRef.owner = result;
    }
    if (!!data.exps) {
        result.exps = data.exps;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    LOGGER.log(result.toFreString())
    return result;
}

export function createClassifierReference(
    data: Partial<MetaElementReference<FreMetaClassifier>>,
): MetaElementReference<FreMetaClassifier> {
    LOGGER.log("createClassifierReference " + data.name);
    const result = MetaElementReference.create<FreMetaClassifier>(data.name ? data.name : "", "FreClassifier");
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    LOGGER.log(result.referred.name)
    return result;
}

export function createFunctionExpression(data: Partial<FreFunctionExp>): FreFunctionExp {
    LOGGER.log("createFunctionExpression");
    let result: FreFunctionExp = new FreFunctionExp();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.param) {
        result.param = data.param;
    }
    if (!!data.applied) {
        result.applied = data.applied;
        result.applied.previous = result;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createVarExpression(data: Partial<FreVarOrFunctionExp>): FreVarExp {
    LOGGER.log("createVarExpression");
    let result: FreVarExp = new FreVarExp();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.applied) {
        result.applied = data.applied;
        result.applied.previous = result;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createAppliedExpression(data: Partial<FreAppliedExp>): FreAppliedExp {
    LOGGER.log("createAppliedExpression");
    const result: FreAppliedExp = new FreAppliedExp();
    if (!!data.exp) {
        result.exp = data.exp;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createLimitedInstanceExp(data: Partial<FreLimitedInstanceExp>): FreLimitedInstanceExp {
    LOGGER.log("createLimitedInstanceExp");
    const result: FreLimitedInstanceExp = new FreLimitedInstanceExp();
    if (!!data.conceptName) {
        result.conceptName = data.conceptName;
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

export function createSimpleExpression(data: Partial<FreLangSimpleExp>): FreLangSimpleExp {
    LOGGER.log("createSimpleExpression");
    const result: FreLangSimpleExp = new FreLangSimpleExp();
    // when the normal check is present, a value of 0 will not be passed to result
    result.value = data.value ? data.value : 0;
    return result;
}
