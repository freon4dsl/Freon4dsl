import { Checker } from "../../utils/Checker";
import { PiLanguageUnit, PiConcept, PiClassifier, PiProperty } from "./PiLanguage";
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
            LOGGER.error(this, `Expression Tester definition checker does not known the language, exiting [line: ${definition.location?.start.line}, column: ${definition.location?.start.column}].`);
            process.exit(-1);
        }

        this.nestedCheck(
            {
                check: this.language.name === definition.languageName,
                error: `Language reference ('${definition.languageName}') in Test expression checker does not match language '${this.language.name}' ` +
                        `[line: ${definition.location?.start.line}, column: ${definition.location?.start.column}].`,
                whenOk: () => {
                    definition.conceptExps.forEach(rule => {
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
    public checkLangExp(langRef: PiLangExp, enclosingConcept:PiConcept) {
        LOGGER.log("checkLangExp " + langRef.sourceName );
        // if (langRef instanceof PiLangEnumExp) {
        //     this.checkEnumRefExpression(langRef, enclosingConcept);
        // } else
        if (langRef instanceof PiLangSelfExp) {
            this.checkSelfExpression(langRef, enclosingConcept);
        } else if (langRef instanceof PiLangConceptExp) {
            this.checkConceptExpression(langRef, enclosingConcept);
        } else if (langRef instanceof PiLangFunctionCallExp) {
            this.checkFunctionCallExpression(langRef, enclosingConcept);
        } else if (langRef instanceof PiLangAppliedFeatureExp) {
            this.checkAppliedFeatureExp(langRef, enclosingConcept);
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
        if (this.strictUseOfSelf) {
            this.nestedCheck(
                {
                    check: langExp.appliedfeature != null,
                    error: `'self' should be followed by '.', followed by a property [line: ${langExp.location?.start.line}, column: ${langExp.location?.start.column}].`,
                    whenOk: () => {
                        this.checkAppliedFeatureExp(langExp.appliedfeature, enclosingConcept);
                    }
                }
            )
        }
    }

    // ConceptName.XXX
    private checkConceptExpression(langExp: PiLangConceptExp, enclosingConcept:PiConcept) {
        LOGGER.log("checkConceptExpression " + langExp?.toPiString());
        // find the concept that langRef.name refers to
        let myConcept = this.language.findConcept(langExp.sourceName);
        let skipCheck: boolean = false;

        if (!(!!myConcept)) {
            //check if the keyword 'container' was used
            if (langExp.sourceName === containerKeyword) {
                // create a dummy concept
                myConcept = new PiConcept();
                myConcept.name = containerKeyword;
                myConcept.language = this.language;
                myConcept.location = langExp.location;
                skipCheck = true;
            }
        }

        langExp.referedElement = PiElementReference.create<PiConcept>(myConcept, "PiConcept");
        if (!skipCheck) {
            this.nestedCheck(
                {
                    check: !!myConcept,
                    error: `Concept '${langExp.sourceName}' not found [line: ${langExp.location?.start.line}, column: ${langExp.location?.start.column}].`,
                    whenOk: () => {
                        this.nestedCheck(
                            {
                                check: langExp.appliedfeature != null,
                                error: `Concept '${myConcept.name}' should be followed by '.', followed by a property [line: ${langExp.location?.start.line}, column: ${langExp.location?.start.column}].`,
                                whenOk: () => {
                                    this.checkAppliedFeatureExp(langExp.appliedfeature, myConcept);
                                }
                            }
                        );
                    }
                }
            );
        }
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
                        whenOk: () => langExp.actualparams?.forEach( p =>
                            this.checkLangExp(p, enclosingConcept)
                        )}
                    );
                } else {
                    this.nestedCheck({
                        check: langExp.actualparams.length === 2,
                        error:  `Function '${functionName}' in '${enclosingConcept.name}' should have 2 parameters, ` +
                            `found ${langExp.actualparams.length} [line: ${langExp.location?.start.line}, column: ${langExp.location?.start.column}].`,
                        whenOk: () => langExp.actualparams?.forEach( p =>
                            this.checkLangExp(p, enclosingConcept)
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
            }
        }
        this.nestedCheck({
            check: !!feat.referedElement.referred,
            error: `Cannot find property '${feat.sourceName}' in '${enclosingConcept.name}'` +
                ` [line: ${feat.location?.start.line}, column: ${feat.location?.start.column}].`,
            whenOk: () => {
                if (feat.appliedfeature != null) {
                    this.checkAppliedFeatureExp(feat.appliedfeature, feat.referedElement.referred.type.referred);
                }
            }
        });
    }
}
