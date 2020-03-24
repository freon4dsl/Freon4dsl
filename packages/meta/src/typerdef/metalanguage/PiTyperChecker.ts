import { Checker } from "../../utils/Checker";
import { PiLanguageUnit, PiLangProperty, PiLangConcept } from "../../languagedef/metalanguage/PiLanguage";
import { ConformsTypeRule, PiTyperDef, PiTyperRule, InferenceRule, IsTypeRule, TypeEqualsRule, PropertyCalculation, TypeOfCalculation, CommonSuperTypeCalculation, PiCalculation, PiTypeValue } from "./PiTyperDefLang";
import { PiLangAppliedFeatureExp, PiLangExp, PiLangEnumExp, PiLangThisExp, PiLangAnyTypeExp } from "../../languagedef/metalanguage/PiLangExpressions";
import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";
import { PiLanguageExpressionChecker } from "../../languagedef/metalanguage/PiLanguageExpressionChecker";
import { PiLogger } from "../../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("PiTyperChecker"); // .mute();
export class PiTyperChecker extends Checker<PiTyperDef> {
    verbose: boolean = false;
    definition: PiTyperDef;
    myExpressionChecker : PiLanguageExpressionChecker;
    
    constructor(language: PiLanguageUnit) {
        super();
        this.language = language;
        this.myExpressionChecker = new PiLanguageExpressionChecker(this.language);
        this.myExpressionChecker.myTyperChecker = this;
    }

    public check(definition: PiTyperDef, verbose: boolean): void {
        this.verbose = verbose;
        this.definition = definition;
        if (verbose) LOGGER.log("Checking typer definition '" + definition.name + "'");

        if( this.language === null ) {
            LOGGER.error(this,  "Typer definition checker does not known the language, exiting.");
            process.exit(-1);
        }

        this.nestedCheck(
            {
                check: this.language.name === definition.languageName,
                error: `Language reference ('${definition.languageName}') in Typer Definition '${definition.name}' does not match language '${this.language.name}'.`,
                whenOk: () => {
                    definition.typerRules.forEach(rule => {    
                        this.checkTyperRule(rule);
                    });        
                }
            });
    }

    public checkAnyTypeExp(exp: PiLangAnyTypeExp) {
        LOGGER.log("Checking AnyType Expression " + exp?.toPiString());
    }

    private checkTyperRule(rule: PiTyperRule) {
        if (rule instanceof IsTypeRule) {
            for (let ref of rule.types) {
                this.checkElementReference(ref);
            }
        } else if (rule instanceof InferenceRule) {
            this.checkElementReference(rule.conceptRef);

            let enclosingConcept = rule.conceptRef.referedElement(); 
            if (enclosingConcept && !rule.isAbstract) {
                this.checkCalculation(rule.calculation, enclosingConcept);
            }
        } else if (rule instanceof TypeEqualsRule) {
            // TODO @anyType.base should not be used here
            this.checkTypeValue(rule.type1);
            this.checkTypeValue(rule.type2);
        } else if (rule instanceof ConformsTypeRule) {
            this.checkTypeValue(rule.type1);
            this.checkTypeValue(rule.type2);
        }        
    }
    
    private checkTypeValue(typeVal: PiTypeValue) {
        // if (typeVal.enumRef) this.myExpressionChecker.checkLangExp(typeVal.enumRef, enclosingConcept);
        if (typeVal.allTypes && typeVal.typeProperty) {
            // check if the property is present on each concept, it should be a meta-property
            this.simpleCheck(typeVal.typeProperty.sourceName === 'base', "Expected '@anyType.base', found '" + typeVal.toPiString() + "'");
        }
    }

    private checkCalculation(calc: PiCalculation, enclosingConcept: PiLangConcept) {
        if( calc instanceof PropertyCalculation) this.checkPropertyCalculation(calc, enclosingConcept);
        if( calc instanceof TypeOfCalculation) this.checkTypeOfCalculation(calc, enclosingConcept);
        if( calc instanceof CommonSuperTypeCalculation) this.checkCommonSuperTypeCalculation(calc, enclosingConcept);
    }

    private checkCommonSuperTypeCalculation(calc: CommonSuperTypeCalculation, enclosingConcept: PiLangConcept) {
        this.checkLangReference(calc.type1, enclosingConcept);
        this.checkLangReference(calc.type2, enclosingConcept);
        // TODO should check whether there is an inference rule for calc.property1 and calc.property2
    }

    private checkTypeOfCalculation(calc: TypeOfCalculation, enclosingConcept: PiLangConcept) {
        this.checkLangReference(calc.type, enclosingConcept);
        // TODO should check whether there is an inference rule for calc.type
    }

    private checkPropertyCalculation(calc: PropertyCalculation, enclosingConcept: PiLangConcept) {
        this.checkLangReference(calc.property, enclosingConcept);
        // TODO should check whether there is an inference rule for calc.property
        // this.checkHasType(calc.property);
    }

    // private checkHasType(langRef: PiLangExp) {
    //     let found: boolean = false;
    //     for( let rule of this.definition.typerRules ) {
    //         if (rule instanceof InferenceRule) {
    //             if (langRef instanceof PiLangEnumExp) {
    //                 // langRef.astEnumType should be in @isType { ... }

    //                 this.simpleCheck(found, "Enumeration '" + name + "' is not a type" );
    //             } else if (langRef instanceof PiLangThisExp) {
    //                 // astProperty of the last appliedFeature in langRef should have an inference Rule, 
    //                 // or its type should be in @isType { ... }
    //                 // if( langRef.astConcept.name = rule.conceptRef.concept().name ) found = true;
    //                 // this.simpleCheck(found, "There should be an inference rule for '" + langRef.toPiString() + "'" );
    //             } 
    //         }
    //     }
    //     this.simpleCheck(found, "There should be an inference rule for '" + langRef.toPiString() + "'" );
    // }
    
    private checkElementReference(reference: PiLangConceptReference) {
        // Note that the following statement is crucial, because the model we are testing is separate
        // from the model of the language.
        // If it is not set, the conceptReference will not find the refered language concept.
        reference.language = this.language;

        this.simpleCheck(reference.referedElement() !== undefined, `Reference to ${reference.name} cannot be resolved`);
    }

    checkLangReference(langRef: PiLangExp, enclosingConcept:PiLangConcept) {
        // if (this.verbose) LOGGER.log("Checking Language Reference " + langRef.toPiString() );
        this.nestedCheck(
            {
                check: !(langRef instanceof PiLangAppliedFeatureExp),
                error: "Expected an enumeration value, or 'this'",
                whenOk: () => {
                    this.myExpressionChecker.checkLangExp(langRef, enclosingConcept);
                }
            })
    }

    // checkPiLangEnumExp(langRef: PiLangEnumExp) {
    //     // if (this.verbose) LOGGER.log("Checking Enumeration Reference " + langRef.toPiString());
    //     let myEnumType = this.language.findEnumeration(langRef.sourceName);
    //     this.nestedCheck({
    //         check: myEnumType != null,
    //         error: `Cannot find enumeration ${langRef.sourceName}`,
    //         whenOk: () => {
    //             this.nestedCheck({
    //                 check: langRef.appliedfeature != null, 
    //                 error:`${langRef.sourceName} should be followed by ':', followed by a literal`,
    //                 whenOk: () => {
    //                     // find literal in enum
    //                     // let myLiteral = myEnumType.literals.find(l => l === langRef.appliedfeature);
    //                     // this.simpleCheck(myLiteral != null,`Literal '${langRef.appliedfeature}' unknown in '${langRef.sourceName}'`);
    //                     // // set the found languge element
    //                     // langRef.astEnumType = myEnumType;
    //                 }
    //             });
    //         }
    //     });
    // }

    // checkAndResolvePropRef(feat: PiLangAppliedFeatureExp, enclosingConcept:PiLangConcept) {
    //     // if (this.verbose) LOGGER.log("Resolving: " + feat.toPiString());
    //     let found : PiLangProperty;
    //     for ( let e of enclosingConcept.allProperties() ) {
    //         if (e.name === feat.sourceName) {
    //             found = e;
    //         }
    //     }
    //     // this.nestedCheck({
    //     //     check: !!found, 
    //     //     error: "Cannot find property, part, or reference '" + feat.sourceName + "' in '" + enclosingConcept.name + "'",
    //     //     whenOk: () => {
    //     //         if(feat.appliedFeature != null && found instanceof PiLangConceptPropertyappliedFeature, (found as PiLangConceptProperty                }
    //     //     }
    //     // });
    // }
}

