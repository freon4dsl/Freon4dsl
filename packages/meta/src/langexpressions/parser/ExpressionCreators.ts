import {
    FreLangSimpleExp,
    FreLimitedInstanceExp,
    FreAppliedExp,
    FreComposedExpression,
    FreSelfExp,
    FreFunctionExp,
    FrePropertyExp
} from '../metalanguage/FreLangExpressions.js';
import { MetaLogger } from "../../utils/MetaLogger.js";
import { Names } from "../../utils/index.js";
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
    return result;
}

export function createConceptExps(data: Partial<TestExpressionsForConcept>): TestExpressionsForConcept {
    LOGGER.log("createConceptExps");
    const result = new TestExpressionsForConcept();
    result.name = data.conceptRef?.name + "ExpressionSet";
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

export function createClassifierReference(
    data: Partial<MetaElementReference<FreMetaClassifier>>,
): MetaElementReference<FreMetaClassifier> {
    LOGGER.log("createClassifierReference " + data.name);
    const result = MetaElementReference.create<FreMetaClassifier>(data.name ? data.name : "", "FreClassifier");
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createFunctionExpression(data: Partial<FreComposedExpression>): FreFunctionExp {
    LOGGER.log("createFunctionExpression");
    let result: FreComposedExpression = new FreFunctionExp();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.param) {
        result.param = data.param;
    }
    if (!!data.applied) {
        result.applied = data.applied;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createVarExpression(data: Partial<FreComposedExpression>): FreComposedExpression {
    LOGGER.log("createVarExpression");
    let result: FreComposedExpression = new FrePropertyExp();
    if (!!data.name) {
        if (data.name === Names.nameForSelf) {
            result = new FreSelfExp();
        } else {
            result.name = data.name;
        }
    }
    if (!!data.applied) {
        result.applied = data.applied;
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
