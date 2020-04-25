import { Checker } from "../../utils/Checker";
import { PiLanguageUnit, PiConcept, PiClassifier, PiProperty, PiPrimitiveProperty } from "./PiLanguage";
import { LanguageExpressionTester, TestExpressionsForConcept } from "../../languagedef/parser/LanguageExpressionTester";
import { PiLangExp, PiLangSelfExp, PiLangAppliedFeatureExp, PiLangConceptExp, PiLangFunctionCallExp } from "./PiLangExpressions";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiElementReference } from "./PiElementReference";

const LOGGER = new PiLogger("PiLanguageExpressionChecker"); //.mute();
const validFunctionNames : string[] = [ "commonSuperType", "conformsTo", "equalsType", "typeof" ];
const containerKeyword : string = "container";

export class PiLanguageExpressionChecker extends Checker<LanguageExpressionTester> {
    strictUseOfSelf: boolean = true; // if true, then a ThisExpression must have an appliedfeature

    constructor(language: PiLanguageUnit) {
        super(language);
    }

    public check(definition: LanguageExpressionTester): void {
        LOGGER.log("Checking test expressions");
        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Expression Tester definition checker does not known the language, exiting [line: ${definition.location?.start.line}, column: ${definition.location?.start.column}].`);
        }

        this.nestedCheck(
            {
                check: this.language.name === definition.languageName,
                error: `Language reference ('${definition.languageName}') in Test expression checker does not match language '${this.language.name}' ` +
                        `[line: ${definition.location?.start.line}, column: ${definition.location?.start.column}].`,
                whenOk: () => {
                    definition.language = this.language;
                    definition.conceptExps.forEach(rule => {
                        rule.language = this.language;
                        this.checkLangExpSet(rule);
                    });
                }
            });
    }

    // ConceptName { exp exp exp }
    private checkLangExpSet(rule: TestExpressionsForConcept) {
        LOGGER.log("checkLangSetExp");
        this.checkConceptReference(rule.conceptRef);

        let enclosingConcept = rule.conceptRef.referred;
        if (enclosingConcept) {
            rule.exps.forEach(tr => {
                tr.language = this.language;
                this.checkLangExp(tr, enclosingConcept);
            });
        }
    }

    // ConceptName
    public checkConceptReference(reference: PiElementReference<PiClassifier>) {
        LOGGER.log("checkConceptReference " + reference?.name);
        // Note that the following statement is crucial, because the model we are testing is separate
        // from the model of the language.
        // If it is not set, the conceptReference will not find the refered language concept.
        // reference.language = this.language;

        this.nestedCheck(
            {
                check: reference.name !== undefined,
                error: `Concept reference should have a name [line: ${reference.location?.start.line}, column: ${reference.location?.start.column}].`,
                whenOk: () => this.nestedCheck(
                    {
                        check: reference.referred !== undefined,
                        error: `Concept reference to ${reference.name} cannot be resolved [line: ${reference.location?.start.line}, column: ${reference.location?.start.column}].`
                    })
            })
    }

    // exp
    public checkLangExp(langExp: PiLangExp, enclosingConcept:PiConcept) {
        LOGGER.log("checkLangExp " + langExp.toPiString() );
        // if (langRef instanceof PiLangEnumExp) {
        //     this.checkEnumRefExpression(langRef, enclosingConcept);
        // } else
        if (langExp instanceof PiLangSelfExp) {
            this.checkSelfExpression(langExp, enclosingConcept);
        } else if (langExp instanceof PiLangConceptExp) {
            this.checkConceptExpression(langExp, enclosingConcept);
        } else if (langExp instanceof PiLangFunctionCallExp) {
            this.checkFunctionCallExpression(langExp, enclosingConcept);
        } else if (langExp instanceof PiLangAppliedFeatureExp) {
            this.checkAppliedFeatureExp(langExp, enclosingConcept);
        }
    }

    // EnumType:literal
    // private checkEnumRefExpression(langExp: PiLangEnumExp, enclosingConcept:PiConcept) {
    //     LOGGER.log("checkEnumRefExpression " + langExp?.toPiString());
    //     let myEnumType = this.language.findEnumeration(langExp.sourceName);
    //     langExp.referedElement = myEnumType;
    //     this.nestedCheck({
    //         check: !!myEnumType,
    //         error: `Cannot find enumeration ${langExp.sourceName} [line: ${langExp.location?.start.line}, column: ${langExp.location?.start.column}].`,
    //         whenOk: () => {
    //             if (!!langExp.appliedfeature) { // if an appliedfeature is present, it should refer to one of the literals
    //                 // find literal in enum
    //                 let foundLiteral = myEnumType.literals.find(l => l === langExp.appliedfeature.sourceName);
    //                 this.simpleCheck(langExp.appliedfeature.sourceName === foundLiteral,
    //                     `${langExp.appliedfeature.sourceName} is not a literal of ${myEnumType.name} [line: ${langExp.location?.start.line}, column: ${langExp.location?.start.column}].`
    //                 );
    //             }
    //         }
    //     });
    // }

    // self.XXX
    private checkSelfExpression(langExp: PiLangSelfExp, enclosingConcept:PiConcept) {
        LOGGER.log("checkSelfExpression " + langExp?.toPiString());
        langExp.referedElement = PiElementReference.create<PiConcept>(enclosingConcept, "PiConcept");
        langExp.referedElement.owner = langExp;
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
    private checkConceptExpression(langExp: PiLangConceptExp, enclosingConcept:PiConcept) {
        LOGGER.log("checkConceptExpression " + langExp?.toPiString());
        //check if the keyword 'container' was used
        this .nestedCheck( {
            check: langExp.sourceName === containerKeyword,
            error: `Expression should start with 'self' [line: ${langExp.location?.start.line}, column: ${langExp.location?.start.column}].`,
            whenOk: () => {
                langExp.referedElement = PiElementReference.create<PiConcept>(enclosingConcept, "PiConcept");
            }
        });
    }

    // someFunction( XXX, YYY )
    private checkFunctionCallExpression(langExp: PiLangFunctionCallExp, enclosingConcept:PiConcept) {
        LOGGER.log("checkFunctionCallExpression " + langExp?.toPiString());
        let functionName = validFunctionNames.find(name => name === langExp.sourceName);
        // TODO ??? set langRef.referedElement to one of the predefined functions
        this.nestedCheck({
            check: !!functionName,
            error: `${langExp.sourceName} is not a valid function [line: ${langExp.location?.start.line}, column: ${langExp.location?.start.column}].`,
            whenOk: () => {
                if (langExp.sourceName === validFunctionNames[3]) { // "typeof"
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
        for ( let e of enclosingConcept.allProperties() ) {
            if (e.name === feat.sourceName) {
                feat.referedElement = PiElementReference.create<PiProperty>(e, "PiProperty");
                feat.referedElement.owner = feat;
                LOGGER.log("found: " + feat.referedElement.referred.name);
            }
        }
        this.nestedCheck({
            check: !!feat.referedElement && !!feat.referedElement.referred,
            error: `Cannot find property '${feat.sourceName}' in '${enclosingConcept.name}'` +
                ` [line: ${feat.location?.start.line}, column: ${feat.location?.start.column}].`,
            whenOk: () => {
                if (feat.appliedfeature != null) {
                    feat.appliedfeature.language = feat.language;
                    this.checkAppliedFeatureExp(feat.appliedfeature, feat.referedElement.referred.type.referred);
                }
            }
        });
    }
}
