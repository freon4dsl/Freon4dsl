import { Checker } from "../../utils/Checker";
import { PiLanguageUnit, PiLangProperty, PiLangConcept, PiLangConceptProperty, PiLangPrimitiveProperty, PiLangClass } from "../../languagedef/metalanguage/PiLanguage";
import { ConceptRuleSet, PiValidatorDef, CheckEqualsTypeRule, ValidationRule, CheckConformsRule, NotEmptyRule, ValidNameRule } from "./ValidatorDefLang";
import { PiLangConceptReference, PiLangPropertyReference } from "../../languagedef/metalanguage/PiLangReferences";
import { PiLangAppliedFeatureExp, PiLangExp, PiLangEnumExp, PiLangThisExp } from "../../languagedef/metalanguage/PiLangExpressions";
import { PiLogger } from "../../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("ValidatorGenerator"); // .mute();
export class ValidatorChecker extends Checker<PiValidatorDef> {
    
    constructor(language: PiLanguageUnit) {
        super();
        this.language = language;
    }

    public check(definition: PiValidatorDef, verbose: boolean): void {
        if (verbose) LOGGER.log("Checking validator Definition '" + definition.validatorName + "'");

        if( this.language === null ) {
            LOGGER.error(this,  "Validator definition checker does not known the language, exiting.");
            process.exit(-1);
        }

        this.nestedCheck(
            {
                check: this.language.name === definition.languageName,
                error: `Language reference ('${definition.languageName}') in Validation Definition '${definition.validatorName}' does not match language '${this.language.name}'.`,
                whenOk: () => {
                    definition.conceptRules.forEach(rule => {    
                        this.checkConceptRule(rule);
                    });        
                }
            });
    }

    private checkConceptRule(rule: ConceptRuleSet) {
        this.checkConceptReference(rule.conceptRef);

        let enclosingConcept = rule.conceptRef.referedElement(); 
        if (enclosingConcept) {
            rule.rules.forEach(tr => {
                this.checkRule(tr, enclosingConcept);
            });
        }
    }

    private checkConceptReference(reference: PiLangConceptReference) {
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

    checkRule(tr: ValidationRule, enclosingConcept: PiLangConcept) {
        if( tr instanceof CheckEqualsTypeRule) this.checkEqualsTypeRule(tr, enclosingConcept);
        if( tr instanceof CheckConformsRule) this.checkConformsTypeRule(tr, enclosingConcept);
        if( tr instanceof NotEmptyRule) this.checkNotEmptyRule(tr, enclosingConcept);
        if( tr instanceof ValidNameRule) this.checkValidNameRule(tr, enclosingConcept);
    }

    checkValidNameRule(tr: ValidNameRule, enclosingConcept: PiLangConcept){
        // check whether tr.property (if set) is a property of enclosingConcept
        // if so, set myProperty to this property,
        // otherwise set myProperty to the 'name' property of the EnclosingConcept
        let myProp: PiLangProperty;
        if( tr.property != null ) {
            // TODO use this.resolvePropRef
            let propRef = tr.property;
            if (propRef.sourceName === "this" && tr.property.appliedfeature != null ) {
                propRef = tr.property.appliedfeature;
            }
            for( let e of enclosingConcept.allProperties() ) {
                if(e.name === propRef.sourceName) myProp = e;
            }
            this.simpleCheck(myProp != null, "Cannot find property '" + propRef.sourceName + "' in " + enclosingConcept.name);
            this.simpleCheck(propRef.appliedfeature == null, 
                            "Property used in a ValidName Rule should be a direct property of '" + enclosingConcept.name + "'");
        } else {
            myProp = enclosingConcept.allProperties().find(e => {
                e.name === "name"
            });
            this.simpleCheck(myProp == null, "Cannot find property 'name' in " + enclosingConcept.name);
            tr.property = new PiLangAppliedFeatureExp();
            tr.property.sourceName = "name";
        }
        // check if found property is of type 'string'
        // if (myProp) 
        //     this.simpleCheck(myProp instanceof PiLangPrimitiveProperty && (myProp as PiLangPrimitiveProperty).type === PiPrimTypesEnum.string,
        //                 "Property '" + myProp.name + "' should have type 'string'");
        // TODO find out which elements of the AST need to be set
        // if(tr.property instanceof PropertyRefExpression) {
        //     (tr.property as PropertyRefExpression).astProperty = myProp;
        // }
    }

    checkEqualsTypeRule(tr: CheckEqualsTypeRule, enclosingConcept: PiLangConcept) {
        // check references to types
        this.nestedCheck(
            {
                check: tr.type1 != null || tr.type2 != null,
                error: `Typecheck "equalsType" should have two types to compare`,
                whenOk: () => {
                    // if (verbose) LOGGER.log("Checking EqualsTo ( " + tr.type1.makeString() + ", " + tr.type2.makeString() +" )");
                    this.checkLangReference(tr.type1, enclosingConcept),
                    this.checkLangReference(tr.type2, enclosingConcept)  
                }
            })
    }

    checkConformsTypeRule(tr: CheckConformsRule, enclosingConcept: PiLangConcept) {
        // check references to types
        this.nestedCheck(
            {
                check: tr.type1 != null || tr.type2 != null,
                error: `Typecheck "conformsTo" should have two types to compare`,
                whenOk: () => {
                    // if (verbose) LOGGER.log("Checking ConformsTo ( " + tr.type1.makeString() + ", " + tr.type2.makeString() + " )");
                    this.checkLangReference(tr.type1, enclosingConcept);
                    this.checkLangReference(tr.type2, enclosingConcept)  
                }
            })
    }

    checkNotEmptyRule(nr: NotEmptyRule, enclosingConcept: PiLangConcept) {
        // check whether nr.property is a property of enclosingConcept
        // and whether it is a list 
        // if so, set myProperty to this property,
        let myProp : PiLangProperty;
        if( nr.property != null ) {
            this.checkLangReference(nr.property, enclosingConcept);
        }
        // TODO set nr.property
    }

    checkLangReference(langRef: PiLangExp, enclosingConcept:PiLangConcept) {
        // if (verbose) LOGGER.log("Checking Language Reference " + langRef.sourceName );
        if (langRef instanceof PiLangEnumExp) {
            this.checkEnumRefExpression(langRef, enclosingConcept);
        } else if (langRef instanceof PiLangThisExp) {
            this.checkThisExpression(langRef, enclosingConcept);
        } else if (langRef instanceof PiLangAppliedFeatureExp) {
            this.checkPropertyRefExpression(langRef, enclosingConcept);
        }
    }

    checkThisExpression(langRef: PiLangThisExp, enclosingConcept:PiLangConcept) {
        // if (verbose) LOGGER.log("Checking 'this' Reference " + langRef.makeString());
        this.nestedCheck(
            {
                check: langRef.appliedfeature != null,
                error: `'this' should be followed by '.', followed by a property name`,
                whenOk: () => {
                    this.resolvePropRef(langRef.appliedfeature, enclosingConcept);
                }
            }
        )
    }

    checkEnumRefExpression(langRef: PiLangEnumExp, enclosingConcept:PiLangConcept) {
        // if (verbose) LOGGER.log("Checking Enumeration Reference " + langRef.makeString());
        let myEnumType = this.language.findEnumeration(langRef.sourceName);
        this.nestedCheck({
            check: myEnumType != null,
            error: `Cannot find enumeration ${langRef.sourceName}`,
            whenOk: () => {
                this.nestedCheck({
                    check: langRef.appliedfeature != null, 
                    error:`${langRef.sourceName} should be followed by '.', followed by a literal`,
                    whenOk: () => {
                        // find literal in enum
                        // let myLiteral = myEnumType.literals.find(l => l === langRef.appliedfeature.reference().name);
                        // this.simpleCheck(myLiteral != null,`Literal '${langRef.appliedfeature}' unknown in '${langRef.sourceName}'`);
                        // set the found languge element
                        // langRef.astEnumType = myEnumType;
                        // if (verbose) LOGGER.log("FOUND enum " + langRef.astEnumType.name + " with literal " + langRef.literalName);
                    }
                });
            }
        });
    }

    checkPropertyRefExpression(langRef: PiLangAppliedFeatureExp, enclosingConcept:PiLangConcept) {
        LOGGER.log("Checking Property Reference " + langRef.toString());
        // TODO implement
    }

    resolvePropRef(feat: PiLangAppliedFeatureExp, enclosingConcept:PiLangConcept) {
        let found : PiLangProperty;
        for ( let e of enclosingConcept.allProperties() ) {
            if (e.name === feat.sourceName) {
                found = e;
            }
        }
        this.nestedCheck({
            check: found != null, 
            error: "Cannot find property, part, or reference '" + feat.sourceName + "' in '" + enclosingConcept.name + "'",
            whenOk: () => {
                if(feat.appliedfeature != null && found instanceof PiLangConceptProperty ) {
                    this.resolvePropRef(feat.appliedfeature, (found as PiLangConceptProperty).type.referedElement());        
                }
            }
        });
    }
}

