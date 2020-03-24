import { Checker } from "../../utils/Checker";
import { PiLangConceptProperty, PiLanguageUnit, PiLangBinaryExpressionConcept, PiLangExpressionConcept, PiLangPrimitiveProperty, PiLangClass, PiLangConcept, PiLangProperty } from "./PiLanguage";
import { PiLangConceptReference } from "./PiLangReferences";
import { LanguageExpressionTester, TestExpressionsForConcept } from "../../languagedef/parser/LanguageExpressionTester";
import { PiLangExp, PiLangEnumExp, PiLangThisExp, PiLangAppliedFeatureExp, PiLangConceptExp, PiLangFunctionCallExp, PiLangAnyTypeExp } from "./PiLangExpressions";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiTyperChecker } from "../../typerdef/metalanguage/PiTyperChecker";

const LOGGER = new PiLogger("PiLanguageExpressionChecker").mute();
const validFunctionNames : string[] = [ "commonSuperType", "conformsTo",  "equalsType" ];

export class PiLanguageExpressionChecker extends Checker<LanguageExpressionTester> {
    myTyperChecker : PiTyperChecker;

    constructor(language: PiLanguageUnit) {
        super();
        this.language = language;
    }

    public check(definition: LanguageExpressionTester, verbose: boolean): void {
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
        LOGGER.log("checkConceptExpression");
        this.checkConceptReference(rule.conceptRef);

        let enclosingConcept = rule.conceptRef.referedElement(); 
        if (enclosingConcept) {
            rule.exps.forEach(tr => {
                this.checkLangExp(tr, enclosingConcept);
            });
        }
    }

    // ConceptName
    private checkConceptReference(reference: PiLangConceptReference) {
        LOGGER.log("checkConceptReference " + reference?.name);
        // Note that the following statement is crucial, because the model we are testing is separate
        // from the model of the language.
        // If it is not set, the conceptReference will not find the refered language concept.
        reference.language = this.language;

        this.nestedCheck(
            {
                check: reference.name !== undefined,
                error: `Concept reference should have a name, but doesn't`,
                whenOk: () => this.nestedCheck(
                    {
                        check: reference.referedElement() !== undefined,
                        error: `Concept reference to ${reference.name} cannot be resolved`
                    })
            })
    }

    // exp
    public checkLangExp(langRef: PiLangExp, enclosingConcept:PiLangConcept) {
        LOGGER.log("Checking Language Reference " + langRef.sourceName );
        if (langRef instanceof PiLangEnumExp) {
            this.checkEnumRefExpression(langRef, enclosingConcept);
        } else if (langRef instanceof PiLangThisExp) {
            this.checkThisExpression(langRef, enclosingConcept);
        } else if (langRef instanceof PiLangConceptExp) {
            this.checkConceptExpression(langRef, enclosingConcept);
        } else if (langRef instanceof PiLangFunctionCallExp) {
            this.checkFunctionCallExpression(langRef, enclosingConcept);
        } else if (langRef instanceof PiLangAnyTypeExp) {
            this.checkAnyTypeExp(langRef, enclosingConcept);
        } else if (langRef instanceof PiLangAppliedFeatureExp) {
            this.checkAppliedFeatureExp(langRef, enclosingConcept);
        }
    }

    // EnumType:literal
    private checkEnumRefExpression(langRef: PiLangEnumExp, enclosingConcept:PiLangConcept) {
        LOGGER.log("Checking Enumeration Reference " + langRef?.toPiString());
        let myEnumType = this.language.findEnumeration(langRef.sourceName);
        this.nestedCheck({
            check: myEnumType != null,
            error: `Cannot find enumeration ${langRef.sourceName}`,
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

    // this.XXX
    private checkThisExpression(langRef: PiLangThisExp, enclosingConcept:PiLangConcept) {
        LOGGER.log("Checking 'this' Expression " + langRef?.toPiString());
        this.nestedCheck(
            {
                check: langRef.appliedfeature != null,
                error: `'this' should be followed by '.', followed by a property`,
                whenOk: () => {
                    this.checkAppliedFeatureExp(langRef.appliedfeature, enclosingConcept);
                }
            }
        )
    }

    // ConceptName.XXX
    private checkConceptExpression(langRef: PiLangConceptExp, enclosingConcept:PiLangConcept) {
        LOGGER.log("Checking Concept Expression " + langRef?.toPiString());
        this.checkConceptReference(langRef.reference);
        let myConcept = langRef.reference.referedElement();

        this.nestedCheck(
            {
                check: langRef.appliedfeature != null,
                error: `Concept should be followed by '.', followed by a property`,
                whenOk: () => {
                    this.checkAppliedFeatureExp(langRef.appliedfeature, myConcept);
                }
            }
        )
    }

    // someFunction( XXX, YYY )
    private checkFunctionCallExpression(langRef: PiLangFunctionCallExp, enclosingConcept:PiLangConcept) {
        LOGGER.log("Checking Function Call Expression " + langRef?.toPiString());
        let functionName = validFunctionNames.find(name => name === langRef.sourceName);
        this.simpleCheck(!!functionName, `${langRef.sourceName} is not a valid function.`); 
        this.nestedCheck({
            check: langRef.actualparams.length === 2,
            error: `Function '${functionName}' in '${enclosingConcept.name}' should have 2 parameters, found ${langRef.actualparams.length}.`,
            whenOk: () => langRef.actualparams?.forEach( p =>
                this.checkLangExp(p, enclosingConcept)
            )}
        );
    }

    // .XXX
    private checkAppliedFeatureExp(feat: PiLangAppliedFeatureExp, enclosingConcept:PiLangConcept) {
        LOGGER.log("Checking Applied Feature " + feat?.toPiString());
        let found : PiLangProperty;
        for ( let e of enclosingConcept.allProperties() ) {
            if (e.name === feat.sourceName) {
                found = e;
            }
        }
        this.nestedCheck({
            check: found != null, 
            error: "Cannot find property '" + feat.sourceName + "' in '" + enclosingConcept.name + "' (maybe '.' should be ':').",
            whenOk: () => {
                if(feat.appliedfeature != null && found instanceof PiLangConceptProperty ) {
                    this.checkAppliedFeatureExp(feat.appliedfeature, (found as PiLangConceptProperty).type.referedElement());        
                }
            }
        });
    }

    // @anyType or @anyType.xxx
    private checkAnyTypeExp(feat: PiLangAnyTypeExp, enclosingConcept:PiLangConcept) {
        LOGGER.log("Checking AnyType Expression " + feat?.toPiString());
        this.myTyperChecker?.checkAnyTypeExp(feat);
    }
}

