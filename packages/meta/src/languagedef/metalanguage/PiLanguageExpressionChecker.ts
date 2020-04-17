import { Checker } from "../../utils/Checker";
import { PiLangConceptProperty, PiLanguageUnit, PiLangConcept, PiLangProperty } from "./PiLanguage";
import { PiLangConceptReference, PiLangPropertyReference } from "./PiLangReferences";
import { LanguageExpressionTester, TestExpressionsForConcept } from "../../languagedef/parser/LanguageExpressionTester";
import { PiLangExp, PiLangEnumExp, PiLangSelfExp, PiLangAppliedFeatureExp, PiLangConceptExp, PiLangFunctionCallExp } from "./PiLangExpressions";
import { PiLogger } from "../../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("PiLanguageExpressionChecker").mute();
const validFunctionNames : string[] = [ "commonSuperType", "conformsTo",  "equalsType" ];

export class PiLanguageExpressionChecker extends Checker<LanguageExpressionTester> {
    strictUseOfSelf: boolean = true; // if true, then a ThisExpression must have an appliedfeature

    constructor(language: PiLanguageUnit) {
        super(language);
    }

    public check(definition: LanguageExpressionTester): void {
        LOGGER.log("Checking test expressions");

        if( !!this.language ) {
            if( !!definition ) {
                this.nestedCheck(
                    {
                        check: this.language.name === definition.languageName,
                        error: `Language reference ('${definition.languageName}') in Test expression checker does not match language '${this.language.name}'.`,
                        whenOk: () => {
                            definition.conceptExps.forEach(rule => {
                                this.checkLangExpSet(rule);
                            });
                        }
                    });
            } else {
                LOGGER.error(this,  "Test expression checker does not known the definition, exiting.");
                process.exit(-1);
            }
        } else {
            LOGGER.error(this,  "Test expression checker does not known the language, exiting.");
            process.exit(-1);
        }
    }

    // ConceptName { exp exp exp }
    private checkLangExpSet(rule: TestExpressionsForConcept) {
        LOGGER.log("checkLangSetExp");
        this.checkConceptReference(rule.conceptRef);

        let enclosingConcept = rule.conceptRef.referedElement();
        if (enclosingConcept) {
            rule.exps.forEach(tr => {
                this.checkLangExp(tr, enclosingConcept);
            });
        }
    }

    // ConceptName
    public checkConceptReference(reference: PiLangConceptReference) {
        LOGGER.log("checkConceptReference " + reference?.name);
        // Note that the following statement is crucial, because the model we are testing is separate
        // from the model of the language.
        // If it is not set, the conceptReference will not find the refered language concept.
        reference.language = this.language;

        this.nestedCheck(
            {
                check: reference.name !== undefined,
                error: `Concept reference should have a name [line: ${reference.location?.start.line}, column: ${reference.location?.start.column}].`,
                whenOk: () => this.nestedCheck(
                    {
                        check: reference.referedElement() !== undefined,
                        error: `Concept reference to ${reference.name} cannot be resolved [line: ${reference.location?.start.line}, column: ${reference.location?.start.column}].`
                    })
            })
    }

    // exp
    public checkLangExp(langRef: PiLangExp, enclosingConcept:PiLangConcept) {
        LOGGER.log("Checking Language Reference " + langRef.sourceName );
        if (langRef instanceof PiLangEnumExp) {
            this.checkEnumRefExpression(langRef, enclosingConcept);

        } else if (langRef instanceof PiLangSelfExp) {
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
    private checkEnumRefExpression(langRef: PiLangEnumExp, enclosingConcept:PiLangConcept) {
        LOGGER.log("Checking Enumeration Reference " + langRef?.toPiString());
        let myEnumType = this.language.findEnumeration(langRef.sourceName);
        langRef.referedElement = myEnumType;
        this.nestedCheck({
            check: !!myEnumType,
            error: `Cannot find enumeration ${langRef.sourceName} [line: ${langRef.location?.start.line}, column: ${langRef.location?.start.column}].`,
            whenOk: () => {
                if (!!langRef.appliedfeature) { // if an appliedfeature is present, it should refer to one of the literals
                    // find literal in enum
                    let foundLiteral = myEnumType.literals.find(l => l === langRef.appliedfeature.sourceName);
                    this.simpleCheck(langRef.appliedfeature.sourceName === foundLiteral,
                        `${langRef.appliedfeature.sourceName} is not a literal of ${myEnumType.name}`
                    );
                }
            }
        });
    }

    // self.XXX
    private checkSelfExpression(langRef: PiLangSelfExp, enclosingConcept:PiLangConcept) {
        LOGGER.log("Checking 'self' Expression " + langRef?.toPiString());
        langRef.referedElement = enclosingConcept;
        if (this.strictUseOfSelf) {
            this.nestedCheck(
                {
                    check: langRef.appliedfeature != null,
                    error: `'self' should be followed by '.', followed by a property [line: ${langRef.location?.start.line}, column: ${langRef.location?.start.column}].`,
                    whenOk: () => {
                        this.checkAppliedFeatureExp(langRef.appliedfeature, enclosingConcept);
                    }
                }
            )
        }
    }

    // ConceptName.XXX
    private checkConceptExpression(langRef: PiLangConceptExp, enclosingConcept:PiLangConcept) {
        LOGGER.log("Checking Concept Expression " + langRef?.toPiString());
        // find the concept that langRef.name refers to
        const myConcept = this.language.findConcept(langRef.sourceName);
        langRef.referedElement = myConcept;

        this.nestedCheck(
            {
                check: !!myConcept,
                error: `Concept '${langRef.sourceName}' not found [line: ${langRef.location?.start.line}, column: ${langRef.location?.start.column}].`,
                whenOk: () => {
                    this.nestedCheck(
                        {
                            check: langRef.appliedfeature != null,
                            error: `Concept should be followed by '.', followed by a property [line: ${langRef.location?.start.line}, column: ${langRef.location?.start.column}].`,
                            whenOk: () => {
                                this.checkAppliedFeatureExp(langRef.appliedfeature, myConcept);
                            }
                        }
                    );
                }
            }
        );
    }

    // someFunction( XXX, YYY )
    private checkFunctionCallExpression(langRef: PiLangFunctionCallExp, enclosingConcept:PiLangConcept) {
        LOGGER.log("Checking Function Call Expression " + langRef?.toPiString());
        let functionName = validFunctionNames.find(name => name === langRef.sourceName);
        // TODO set langRef.referedElement to one of the predefined functions
        this.simpleCheck(!!functionName, `${langRef.sourceName} is not a valid function.`);
        this.nestedCheck({
            check: langRef.actualparams.length === 2,
            error: `Function '${functionName}' in '${enclosingConcept.name}' should have 2 parameters, ` +
                `found ${langRef.actualparams.length} [line: ${langRef.location?.start.line}, column: ${langRef.location?.start.column}].`,
            whenOk: () => langRef.actualparams?.forEach( p =>
                this.checkLangExp(p, enclosingConcept)
            )}
        );
    }

    // .XXX
    private checkAppliedFeatureExp(feat: PiLangAppliedFeatureExp, enclosingConcept:PiLangConcept) {
        LOGGER.log("Checking Applied Feature " + feat?.toPiString());
        for ( let e of enclosingConcept.allProperties() ) {
            if (e.name === feat.sourceName) {
                feat.referedElement = e;
            }
        }
        this.nestedCheck({
            check: !!feat.referedElement,
            error: `Cannot find property '${feat.sourceName}' in '${enclosingConcept.name}'` +
                ` [line: ${feat.location?.start.line}, column: ${feat.location?.start.column}]. (Maybe '.' should be ':'?)`,
            whenOk: () => {
                if (feat.appliedfeature != null) {
                    this.checkAppliedFeatureExp(feat.appliedfeature, (feat.referedElement.type.referedElement() as PiLangConcept));
                }
            }
        });
    }
}
