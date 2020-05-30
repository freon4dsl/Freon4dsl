import { Checker } from "../../utils/Checker";
import { PiLanguageUnit, PiConcept, PiClassifier, PiProperty, PiLimitedConcept, PiInstance } from "./PiLanguage";
import { LanguageExpressionTester, TestExpressionsForConcept } from "../../languagedef/parser/LanguageExpressionTester";
import {
    PiLangExp,
    PiLangSelfExp,
    PiLangAppliedFeatureExp,
    PiLangConceptExp,
    PiLangFunctionCallExp,
    PiInstanceExp,
    PiLangSimpleExp
} from "./PiLangExpressions";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiMetaEnvironment } from "./PiMetaEnvironment";
import { PiElementReference } from "./PiElementReference";

const LOGGER = new PiLogger("PiLangExpressionChecker").mute();
const validFunctionNames : string[] = [ "conformsTo", "equalsType", "typeof" ];
const containerKeyword : string = "container";

export class PiLangExpressionChecker extends Checker<LanguageExpressionTester> {
    strictUseOfSelf: boolean = true; // if true, then a ThisExpression must have an appliedfeature

    constructor(language: PiLanguageUnit) {
        super(language);
    }

    public check(definition: LanguageExpressionTester): void {
        LOGGER.log("Checking test expressions");
        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Expression Tester definition checker does not known the language, exiting [line: ${definition.location?.start.line}, column: ${definition.location?.start.column}].`);
        }
        // Note: this should be done first, otherwise the references will not be resolved
        PiMetaEnvironment.metascoper.language = this.language;

        this.nestedCheck(
            {
                check: this.language.name === definition.languageName,
                error: `Language reference ('${definition.languageName}') in Test expression checker does not match language '${this.language.name}' ` +
                        `[line: ${definition.location?.start.line}, column: ${definition.location?.start.column}].`,
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
        this.checkClassifierReference(rule.conceptRef);

        let enclosingConcept = rule.conceptRef.referred;
        if (!!enclosingConcept) {
            rule.exps.forEach(tr => {
                // tr.language = this.language;
                this.checkLangExp(tr, enclosingConcept);
            });
        }
    }

    // ConceptName
    public checkClassifierReference(reference: PiElementReference<PiClassifier>) {
        LOGGER.log("checkClassifierReference " + reference?.name);

        // Note that the following statement is crucial, because the model we are testing is separate
        // from the model of the language.
        // If it is not set, the conceptReference will not find the refered language concept.
        // reference.language = this.language;
        this.nestedCheck(
            {
                check: reference.name !== undefined,
                error: `Concept reference should have a name [line: ${reference.location?.start.line}, column: ${reference.location?.start.column}].`,
                whenOk: () => {
                    this.nestedCheck(
                    {
                        check: reference.referred !== undefined,
                        error: `Concept reference to '${reference.name}' cannot be resolved [line: ${reference.location?.start.line}, column: ${reference.location?.start.column}].`
                    })}
            })
    }

    // exp
    public checkLangExp(langExp: PiLangExp, enclosingConcept:PiClassifier) {
        LOGGER.log("checkLangExp " + langExp.toPiString() );
        if (langExp instanceof PiInstanceExp) {
            this.checkInstanceExpression(langExp, enclosingConcept);
        } else
        if (langExp instanceof PiLangSelfExp) {
            this.checkSelfExpression(langExp, enclosingConcept);
        } else if (langExp instanceof PiLangConceptExp) {
            this.checkConceptExpression(langExp, enclosingConcept);
        } else if (langExp instanceof PiLangFunctionCallExp) {
            this.checkFunctionCallExpression(langExp, enclosingConcept);
        } else if (langExp instanceof PiLangAppliedFeatureExp) {
            this.checkAppliedFeatureExp(langExp, enclosingConcept);
        } else if (langExp instanceof PiLangSimpleExp) {
            // this.checkSimpleExp(langExp, enclosingConcept);
        }
    }

    // LimitedConcept:instanceName
    public checkInstanceExpression(langExp: PiInstanceExp, enclosingConcept: PiClassifier) {
        LOGGER.log("checkInstanceExpression " + langExp?.toPiString());
        let myLimitedConcept = this.language.findConcept(langExp.sourceName);

        this.nestedCheck( {
            check: !!myLimitedConcept,
            error: `Cannot find limited concept ${langExp.sourceName} [line: ${langExp.location?.start.line}, column: ${langExp.location?.start.column}].`,
            whenOk: () => {
                this.nestedCheck( {
                    check: myLimitedConcept instanceof PiLimitedConcept,
                    error: `Concept ${langExp.sourceName} does not defined any instances [line: ${langExp.location?.start.line}, column: ${langExp.location?.start.column}].`,
                    whenOk: () => {
                        this.nestedCheck( {
                            check: !!langExp.instanceName,
                            error: `A limited concept expression should have an instance name [line: ${langExp.location?.start.line}, column: ${langExp.location?.start.column}].`,
                            whenOk: () => {
                                let foundInstance = (myLimitedConcept as PiLimitedConcept).instances.find(l => l.name === langExp.instanceName);
                                this.simpleCheck(!!foundInstance,
                                    `${langExp.instanceName} is not a predefined instance of ${myLimitedConcept.name} `+
                                            `[line: ${langExp.location?.start.line}, column: ${langExp.location?.start.column}].`
                                );
                                if (!!foundInstance) {
                                    langExp.referredElement = PiElementReference.create<PiInstance>(foundInstance, "PiInstance");
                                }
                            }
                        })
                    }
                })
            }
        });
    }

    // self.XXX
    private checkSelfExpression(langExp: PiLangSelfExp, enclosingConcept:PiClassifier) {
        LOGGER.log("checkSelfExpression " + langExp?.toPiString());
        langExp.referredElement = PiElementReference.create<PiClassifier>(enclosingConcept, "PiConcept");
        langExp.referredElement.owner = langExp;
        if (this.strictUseOfSelf) {
            this.nestedCheck(
                {
                    check: langExp.appliedfeature != null,
                    error: `'self' should be followed by '.', followed by a property [line: ${langExp.location?.start.line}, column: ${langExp.location?.start.column}].`,
                    whenOk: () => {
                        langExp.appliedfeature.language = langExp.language;
                        this.checkAppliedFeatureExp(langExp.appliedfeature, enclosingConcept);
                    }
                }
            )
        }
    }

    // something.XXX -- may not occur, except when the expression is 'container'
    private checkConceptExpression(langExp: PiLangConceptExp, enclosingConcept:PiClassifier) {
        LOGGER.log("checkConceptExpression " + langExp?.toPiString());
        //check if the keyword 'container' was used
        this .nestedCheck( {
            check: langExp.sourceName === containerKeyword,
            error: `Expression should start with 'self' [line: ${langExp.location?.start.line}, column: ${langExp.location?.start.column}].`,
            whenOk: () => {
                langExp.referredElement = PiElementReference.create<PiClassifier>(enclosingConcept, "PiConcept");
                langExp.referredElement.owner = langExp;
            }
        });
    }

    // someFunction( XXX, YYY )
    private checkFunctionCallExpression(langExp: PiLangFunctionCallExp, enclosingConcept:PiClassifier) {
        LOGGER.log("checkFunctionCallExpression " + langExp?.toPiString());
        let functionName = validFunctionNames.find(name => name === langExp.sourceName);
        // TODO ??? set langRef.referredElement to one of the predefined functions
        this.nestedCheck({
            check: !!functionName,
            error: `${langExp.sourceName} is not a valid function [line: ${langExp.location?.start.line}, column: ${langExp.location?.start.column}].`,
            whenOk: () => {
                if (langExp.sourceName === validFunctionNames[2]) { // "typeof"
                    this.nestedCheck({
                        check: langExp.actualparams.length === 1,
                        error:  `Function '${functionName}' in '${enclosingConcept.name}' should have 1 parameter, ` +
                            `found ${langExp.actualparams.length} [line: ${langExp.location?.start.line}, column: ${langExp.location?.start.column}].`,
                        whenOk: () => langExp.actualparams?.forEach( p => {
                                p.language = this.language;
                                this.checkLangExp(p, enclosingConcept);
                            }
                        )}
                    );
                } else {
                    this.nestedCheck({
                        check: langExp.actualparams.length === 2,
                        error:  `Function '${functionName}' in '${enclosingConcept.name}' should have 2 parameters, ` +
                            `found ${langExp.actualparams.length} [line: ${langExp.location?.start.line}, column: ${langExp.location?.start.column}].`,
                        whenOk: () => langExp.actualparams?.forEach( p =>{
                                p.language = this.language;
                                this.checkLangExp(p, enclosingConcept);
                            }
                        )}
                    );
                }
            }
        });
    }

    // .XXX
    private checkAppliedFeatureExp(feat: PiLangAppliedFeatureExp, enclosingConcept:PiClassifier) {
        LOGGER.log("checkAppliedFeatureExp " + feat?.toPiString());

        for (let e of enclosingConcept.allProperties()) {
            if (e.name === feat.sourceName) {
                feat.referredElement = PiElementReference.create<PiProperty>(e, "PiProperty");
                feat.referredElement.owner = feat;
            }
        }
        this.nestedCheck({
            check: !!feat.referredElement && !!feat.referredElement.referred,
            error: `Cannot find property '${feat.sourceName}' in '${enclosingConcept.name}'` +
                ` [line: ${feat.location?.start.line}, column: ${feat.location?.start.column}].`,
            whenOk: () => {
                if (feat.appliedfeature != null) {
                    this.simpleCheck(!feat.referredElement.referred.isList, `List property '${feat.referredElement.name}' should not have an applied expression (.${feat.appliedfeature.toPiString()})` +
                        ` [line: ${feat.location?.start.line}, column: ${feat.location?.start.column}].`);
                    feat.appliedfeature.language = feat.language;
                    this.checkAppliedFeatureExp(feat.appliedfeature, feat.referredElement.referred.type.referred);
                }
            }
        });
    }


}
