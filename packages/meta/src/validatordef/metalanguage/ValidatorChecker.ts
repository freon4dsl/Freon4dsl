import { Checker } from "../../utils/Checker";
import { PiLanguage, PiLangConceptReference, PiLangProperty, PiLangConcept, PiLangElementProperty, PiLangPrimitiveProperty, PiLangPropertyReference } from "../../languagedef/metalanguage/PiLanguage";
import { ConceptRule, ValidatorDef, EqualsTypeRule, Rule, ConformsTypeRule, NotEmptyRule, LangRefExpression, EnumRefExpression, ThisExpression, PropertyRefExpression, ValidNameRule } from "./ValidatorDefLang";

export class ValidatorChecker extends Checker<ValidatorDef> {
    
    constructor(language: PiLanguage) {
        super();
        this.language = language;
    }

    public check(definition: ValidatorDef): void {
        console.log("Checking Validator Definition " + definition.validatorName);

        this.nestedCheck(
            {
                check: true,
                error: "This error never happens"
            });
            definition.conceptRules.forEach(rule => {    
                this.checkConceptRule(rule);
            });
        }

    private checkConceptRule(rule: ConceptRule) {
        this.checkConceptReference(rule.conceptRef);

        let enclosingConcept = rule.conceptRef.concept(); 
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
                        check: reference.concept() !== undefined,
                        error: `Concept reference to ${reference.name} cannot be resolved`
                    })
            })
    }

    checkRule(tr: Rule, enclosingConcept: PiLangConcept) {
        // if( tr instanceof EqualsTypeRule) this.checkEqualsTypeRule(tr, enclosingConcept);
        if( tr instanceof ConformsTypeRule) this.checkConformsTypeRule(tr, enclosingConcept);
        if( tr instanceof NotEmptyRule) this.checkNotEmptyRule(tr, enclosingConcept);
        if( tr instanceof ValidNameRule) this.checkValidNameRule(tr, enclosingConcept);
    }

    checkValidNameRule(tr: ValidNameRule, enclosingConcept: PiLangConcept){
        // check whether tr.property (if set) is a property of enclosingConcept
        // if so, set myProperty to this property,
        // otherwise set myProperty to the 'name' property of the EnclosingConcept
        let myProp : PiLangPrimitiveProperty;
        if( tr.property != null ) {
            let propRef = tr.property;
            if (propRef.sourceName === "this" && tr.property.appliedFeature != null ) {
                propRef = tr.property.appliedFeature;
            }
            for( let e of enclosingConcept.allProperties() ) {
                if(e.name === propRef.sourceName) myProp = e;
            }
            this.simpleCheck(myProp != null, "Valid Name Rule: cannot find property '" + propRef.sourceName + "' in " + enclosingConcept.name);
            // TODO check if there are more names: propRef.appliedFeature != null
        } else {
            myProp = enclosingConcept.allProperties().find(e => {
                e.name === "name"
            });
            this.simpleCheck(myProp == null, "Valid Name Rule: cannot find property 'name' in " + enclosingConcept.name);
            tr.property = new PropertyRefExpression();
            tr.property.sourceName = "name";
        }
        tr.property.myProperty = myProp;
    }

    checkEqualsTypeRule(tr: EqualsTypeRule, enclosingConcept: PiLangConcept) {
        // check references to types
        this.nestedCheck(
            {
                check: tr.type1 != null || tr.type2 != null,
                error: `Typecheck "equalsType" should have two types to compare`,
                whenOk: () => {
                    // console.log("Checking EqualsTo ( " + tr.type1.makeString() + ", " + tr.type2.makeString() +" )");
                    // this.checkLangReference(tr.type1, enclosingConcept),
                    // this.checkLangReference(tr.type2, enclosingConcept)  
                }
            })
    }

    checkConformsTypeRule(tr: ConformsTypeRule, enclosingConcept: PiLangConcept) {
        // check references to types
        this.nestedCheck(
            {
                check: tr.type1 != null || tr.type2 != null,
                error: `Typecheck "conformsTo" should have two types to compare`,
                whenOk: () => {
                    // console.log("Checking ConformsTo ( " + tr.type1.makeString() + ", " + tr.type2.makeString() + " )");
                    // this.checkLangReference(tr.type1, enclosingConcept);
                    // this.checkLangReference(tr.type2, enclosingConcept)  
                }
            })
    }

    checkNotEmptyRule(nr: NotEmptyRule, enclosingConcept: PiLangConcept) {
        // check whether nr.property is a property of enclosingConcept
        // and whether it is a list 
        // if so, set myProperty to this property,
        let myProp : PiLangProperty;
        if( nr.property != null ) {
            let propRef = nr.property;
            if (propRef.sourceName === "this" && nr.property.appliedFeature != null ) {
                propRef = nr.property.appliedFeature;
            }
            let found: boolean = false;
            while(!found) { // TODO should not be done, must be direct prop of enclosingConcept, so brings this to the general function
                for( let e of enclosingConcept.allParts() ) {
                    if(e.name === propRef.sourceName) myProp = e;
                }
                if (myProp == null) {
                    for( let e of enclosingConcept.allPReferences() ) {
                        if(e.name === propRef.sourceName) myProp = e;
                    } 
                }
                if (myProp == null) {
                    for( let e of enclosingConcept.allProperties() ) {
                        if(e.name === propRef.sourceName) myProp = e;
                    } 
                }
                if (myProp != null && propRef.appliedFeature != null && myProp instanceof PiLangElementProperty) {
                    // find the next in the list of applied features
                    propRef = propRef.appliedFeature;
                    enclosingConcept = myProp.type.concept();
                    (propRef as PropertyRefExpression).myProperty = myProp;
                    myProp = null;
                } else {
                   found = true;
                }
            }
            // TODO check if there are more names: propRef.appliedFeature != null,  must be direct prop of enclosingConcept
            this.nestedCheck(
            {
                check: myProp != null, 
                error: "Not Empty Rule: cannot find property, part, or reference '" + propRef.sourceName + "' in " + enclosingConcept.name,
                whenOk: () => {
                    this.simpleCheck(myProp.isList, "Not Empty Rule: part or reference '" + propRef.sourceName + "' in " + enclosingConcept.name + " is not a list");
                }    
            });
        }
        // TODO set nr.property
        // nr.property = myProp;
    }

    checkLangReference(langRef: LangRefExpression, enclosingConcept:PiLangConcept) {
        console.log("Checking Language Reference " + langRef.sourceName );
        if (langRef instanceof EnumRefExpression) {
            this.checkEnumRefExpression(langRef, enclosingConcept);
        } else if (langRef instanceof ThisExpression) {
            this.checkThisExpression(langRef, enclosingConcept);
        } else if (langRef instanceof PropertyRefExpression) {
            this.checkPropertyRefExpression(langRef, enclosingConcept);
        }
    }

    checkThisExpression(langRef: ThisExpression, enclosingConcept:PiLangConcept) {
        console.log("Checking 'this' Reference " + langRef.makeString());
        this.nestedCheck(
            {
                check: langRef.appliedFeature != null,
                error: `'this' should be  followed by '.', followed by a property name`,
                whenOk: () => {
                    this.resolvePropRef(langRef.appliedFeature, enclosingConcept);
                }
            }
        )
    }

    checkEnumRefExpression(langRef: EnumRefExpression, enclosingConcept:PiLangConcept) {
        console.log("Checking Enumeration Reference " + langRef.makeString());
    }

    checkPropertyRefExpression(langRef: PropertyRefExpression, enclosingConcept:PiLangConcept) {
        console.log("Checking Property Reference " + langRef.makeString());
    }

    resolvePropRef(feat: PropertyRefExpression, enclosingConcept:PiLangConcept) {
        let found : PiLangProperty;
        for ( let e of enclosingConcept.allProperties() ) {
            if (e.name === feat.sourceName) {
                found = e;
            }
        }
        if (!found) {
            for ( let e of enclosingConcept.allParts() ) {
                if (e.name === feat.sourceName) {
                    found = e;
                    // feat.myProperty = e;
                    if (found && feat.appliedFeature != null) {
                        this.resolvePropRef(feat.appliedFeature, (found as PiLangElementProperty).type.concept() );
                    }
                }
            }              
        }
        if (!found) {
            for ( let e of enclosingConcept.allPReferences() ) {
                if (e.name === feat.sourceName) {
                    found = e;
                }
            }              
        }

    }
}

