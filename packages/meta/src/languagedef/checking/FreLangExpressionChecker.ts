import { Checker, MetaLogger, CheckRunner, ParseLocationUtil } from "../../utils";
import { LanguageExpressionTester, TestExpressionsForConcept } from "../parser/LanguageExpressionTester";
import { FreLanguage, FreClassifier, FreLimitedConcept, FreInstance, FreLangExp,
    FreLangSelfExp,
    FreLangAppliedFeatureExp,
    FreLangConceptExp,
    FreLangFunctionCallExp,
    FreInstanceExp,
    FreLangSimpleExp,
    FreMetaEnvironment,
    MetaElementReference
} from "../metalanguage";
import { CommonChecker } from "./CommonChecker";

const LOGGER = new MetaLogger("FreLangExpressionChecker").mute();
const validFunctionNames: string[] = ["conformsTo", "equalsType", "typeof", "commonSuperTypeOf", "ancestor"];
const containerKeyword: string = "container";

export class FreLangExpressionChecker extends Checker<LanguageExpressionTester> {
    strictUseOfSelf: boolean = true; // if true, then a ThisExpression must have an appliedfeature
    runner = new CheckRunner(this.errors, this.warnings);

    constructor(language: FreLanguage) {
        super(language);
    }

    public check(definition: LanguageExpressionTester): void {
        LOGGER.log("Checking test expressions");
        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Expression Tester definition checker does not known the language, exiting ` +
                        `${ParseLocationUtil.location(definition)}.`);
        }
        // Note: this should be done first, otherwise the references will not be resolved
        FreMetaEnvironment.metascoper.language = this.language;

        this.runner.nestedCheck(
            {
                check: this.language.name === definition.languageName,
                error: `Language reference ('${definition.languageName}') in Test expression checker does not match language '${this.language.name}' ` +
                        `${ParseLocationUtil.location(definition)}.`,
                whenOk: () => {
                    definition.language = this.language;
                    definition.conceptExps.forEach(rule => {
                        // rule.language = this.language;
                        this.checkLangExpSet(rule);
                    });
                }
            });
    }

    // ConceptName { exp exp exp }
    private checkLangExpSet(rule: TestExpressionsForConcept) {
        LOGGER.log("checkLangSetExp");
        CommonChecker.checkClassifierReference(rule.conceptRef, this.runner);

        const enclosingConcept = rule.conceptRef.referred;
        if (!!enclosingConcept) {
            rule.exps.forEach(tr => {
                // tr.language = this.language;
                this.checkLangExp(tr, enclosingConcept);
            });
        }
    }

    // exp
    public checkLangExp(langExp: FreLangExp, enclosingConcept: FreClassifier) {
        if (!enclosingConcept) {
            LOGGER.error("enclosingConcept is null in 'checkLangExp'.");
            return;
        }
        langExp.language = this.language;
        LOGGER.log("checkLangExp " + langExp.toFreString() );
        if (langExp instanceof FreInstanceExp) {
            this.checkInstanceExpression(langExp);
        } else
        if (langExp instanceof FreLangSelfExp) {
            this.checkSelfExpression(langExp, enclosingConcept);
        } else if (langExp instanceof FreLangConceptExp) {
            this.checkConceptExpression(langExp, enclosingConcept);
        } else if (langExp instanceof FreLangFunctionCallExp) {
            this.checkFunctionCallExpression(langExp, enclosingConcept);
        } else if (langExp instanceof FreLangAppliedFeatureExp) {
            this.checkAppliedFeatureExp(langExp, enclosingConcept);
        } else if (langExp instanceof FreLangSimpleExp) {
            // this.checkSimpleExp(langExp, enclosingConcept);
        }
    }

    // LimitedConcept:instanceName
    public checkInstanceExpression(langExp: FreInstanceExp) {
        LOGGER.log("checkInstanceExpression " + langExp?.toFreString());
        const myLimitedConcept = this.language.findConcept(langExp.sourceName);

        this.runner.nestedCheck( {
            check: !!myLimitedConcept,
            error: `Cannot find limited concept ${langExp.sourceName} ${ParseLocationUtil.location(langExp)}.`,
            whenOk: () => {
                this.runner.nestedCheck( {
                    check: myLimitedConcept instanceof FreLimitedConcept,
                    error: `Concept ${langExp.sourceName} does not defined any instances ${ParseLocationUtil.location(langExp)}.`,
                    whenOk: () => {
                        this.runner.nestedCheck( {
                            check: !!langExp.instanceName,
                            error: `A limited concept expression should have an instance name ${ParseLocationUtil.location(langExp)}.`,
                            whenOk: () => {
                                const foundInstance = (myLimitedConcept as FreLimitedConcept).instances.find(l => l.name === langExp.instanceName);
                                this.runner.simpleCheck(!!foundInstance,
                                    `${langExp.instanceName} is not a predefined instance of ${myLimitedConcept.name} ` +
                                            `${ParseLocationUtil.location(langExp)}.`
                                );
                                if (!!foundInstance) {
                                    langExp.$referredElement = MetaElementReference.create<FreInstance>(foundInstance, "FreInstance");
                                }
                            }
                        });
                    }
                });
            }
        });
    }

    // self.XXX
    private checkSelfExpression(langExp: FreLangSelfExp, enclosingConcept: FreClassifier) {
        LOGGER.log("checkSelfExpression " + langExp?.toFreString());
        langExp.$referredElement = MetaElementReference.create<FreClassifier>(enclosingConcept, "FreConcept");
        langExp.$referredElement.owner = langExp;
        if (this.strictUseOfSelf) {
            this.runner.nestedCheck(
                {
                    check: !!langExp.appliedfeature,
                    error: `'self' should be followed by '.', followed by a property ${ParseLocationUtil.location(langExp)}.`,
                    whenOk: () => {
                        langExp.appliedfeature.language = langExp.language;
                        this.checkAppliedFeatureExp(langExp.appliedfeature, enclosingConcept);
                    }
                }
            );
        }
    }

    // something.XXX -- may not occur, except when the expression is 'owner'
    private checkConceptExpression(langExp: FreLangConceptExp, enclosingConcept: FreClassifier) {
        LOGGER.log("checkConceptExpression " + langExp?.toFreString());
        // check if the keyword 'owner' was used
        this.runner.nestedCheck( {
            check: langExp.sourceName === containerKeyword,
            error: `Expression should start with 'self' ${ParseLocationUtil.location(langExp)}.`,
            whenOk: () => {
                langExp.$referredElement = MetaElementReference.create<FreClassifier>(enclosingConcept, "FreClassifier");
                langExp.$referredElement.owner = langExp;
            }
        });
    }

    // someFunction( XXX, YYY )
    private checkFunctionCallExpression(langExp: FreLangFunctionCallExp, enclosingConcept: FreClassifier) {
        LOGGER.log("checkFunctionCallExpression " + langExp?.toFreString());
        const functionName = validFunctionNames.find(name => name === langExp.sourceName);
        // TODO ??? set langExp.referredElement to one of the predefined functions
        this.runner.nestedCheck({
            check: !!functionName,
            error: `${langExp.sourceName} is not a valid function ${ParseLocationUtil.location(langExp)}.`,
            whenOk: () => {
                let functionType: FreClassifier = null;
                if (langExp.sourceName === validFunctionNames[2]) { // "typeof"
                    this.runner.nestedCheck({
                        check: langExp.actualparams.length === 1,
                        error:  `Function '${functionName}' in '${enclosingConcept.name}' should have 1 parameter, ` +
                            `found ${langExp.actualparams.length} ${ParseLocationUtil.location(langExp)}.`,
                        whenOk: () => langExp.actualparams?.forEach( p => {
                                p.language = this.language;
                                this.checkLangExp(p, enclosingConcept);
                                functionType = p.findRefOfLastAppliedFeature()?.type;
                            }
                        )}
                    );
                } else if (langExp.sourceName === validFunctionNames[4]) { // "ancestor"
                    this.runner.nestedCheck({
                        check: langExp.actualparams.length === 1,
                        error:  `Function '${functionName}' in '${enclosingConcept.name}' should have 1 parameter, ` +
                            `found ${langExp.actualparams.length} ${ParseLocationUtil.location(langExp)}.`,
                        whenOk: () => langExp.actualparams?.forEach( p => {
                                p.language = this.language;
                                const foundClassifier = this.language.findClassifier(p.sourceName);
                                this.runner.nestedCheck({
                                    check: !!foundClassifier,
                                    error: `Cannot find reference to ${p.sourceName} ${ParseLocationUtil.location(langExp)}`,
                                    whenOk: () => {
                                        functionType = foundClassifier;
                                        p.$referredElement = MetaElementReference.create<FreClassifier>(foundClassifier, "FreClassifier");
                                        p.$referredElement.owner = p;
                                    }
                                });
                            }
                        )}
                    );
                } else {
                    this.runner.nestedCheck({
                        check: langExp.actualparams.length === 2,
                        error:  `Function '${functionName}' in '${enclosingConcept.name}' should have 2 parameters, ` +
                            `found ${langExp.actualparams.length} ${ParseLocationUtil.location(langExp)}.`,
                        whenOk: () => langExp.actualparams?.forEach( p => {
                                p.language = this.language;
                                this.checkLangExp(p, enclosingConcept);
                                // TODO set functionType
                            }
                        )}
                    );
                }
                // TODO the following is not yet correct
                if (!!langExp.appliedfeature && !!functionType) {
                    langExp.appliedfeature.language = langExp.language;
                    this.checkAppliedFeatureExp(langExp.appliedfeature, functionType);
                }
            }
        });
    }

    // .XXX
    private checkAppliedFeatureExp(feat: FreLangAppliedFeatureExp, enclosingConcept: FreClassifier) {
        LOGGER.log("checkAppliedFeatureExp " + feat?.toFreString());
        if (!enclosingConcept) {
            LOGGER.error("enclosingConcept is null in 'checkAppliedFeatureExp'.");
            return;
        }
        for (const e of enclosingConcept.allProperties()) {
            if (e.name === feat.sourceName) {
                feat.referredElement = e;
            }
        }
        this.runner.nestedCheck({
            check: !!feat.referredElement,
            error: `Cannot find property '${feat.sourceName}' in '${enclosingConcept.name}' ${ParseLocationUtil.location(feat)}.`,
            whenOk: () => {
                if (!!feat.appliedfeature) {
                    this.runner.simpleCheck(!feat.referredElement.isList,
                        `List property '${feat.referredElement.name}' should not have an applied expression (.${feat.appliedfeature.toFreString()})` +
                        ` ${ParseLocationUtil.location(feat)}.`);
                    feat.appliedfeature.language = feat.language;
                    this.checkAppliedFeatureExp(feat.appliedfeature, feat.referredElement.type);
                }
            }
        });
    }
}
