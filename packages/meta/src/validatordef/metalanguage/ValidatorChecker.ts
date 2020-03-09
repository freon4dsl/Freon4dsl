import { Checker } from "../../utils/Checker";
import { PiLanguage, PiLangConceptReference, PiLangPropertyReference } from "../../languagedef/metalanguage/PiLanguage";
import { ValidatorDef, EqualsTypeRule, TypeRule, ConformsTypeRule, NotEmptyRule, TypeReference } from "./ValidatorDefLang";

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
                // TODO use nestedCheck here            
                this.checkConceptReference(rule.conceptRef)
                rule.typeRules.forEach(tr => this.checkTypeRule(tr, rule.conceptRef));
                rule.notEmptyRules.forEach(nr => this.checkNotEmptyRule(nr));
            });
        }

    checkConceptReference(reference: PiLangConceptReference) {
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
    
    checkTypeRule(tr: TypeRule, enclosingConcept: PiLangConceptReference) {
        if (tr instanceof EqualsTypeRule) this.checkEqualsTypeRule(tr, enclosingConcept);
        if (tr instanceof ConformsTypeRule) this.checkConformsTypeRule(tr, enclosingConcept);
    }
    
    checkEqualsTypeRule(tr: EqualsTypeRule, enclosingConcept: PiLangConceptReference) {
        // console.log("Checking EqualsTo " + tr.type1.sourceName.name + " " + tr.type2.sourceName.name);
        // // check references to types
        // this.nestedCheck(
        //     {
        //         check: tr.type1 !== undefined || tr.type2 !== undefined,
        //         error: `Typecheck equalsType should have two types to compare`,
        //         whenOk: () => {
        //             this.checkTypeReference(tr.type1, enclosingConcept),
        //             this.checkTypeReference(tr.type2, enclosingConcept)  
        //         }
        //     })
    }

    checkConformsTypeRule(tr: ConformsTypeRule, enclosingConcept: PiLangConceptReference) {
        console.log("Checking ConformsTo " + tr.type1.sourceName.name + " " + tr.type2.sourceName.name);
        // check references to types
        this.nestedCheck(
            {
                check: tr.type1 !== undefined || tr.type2 !== undefined,
                error: `Typecheck conformsTo should have two types to compare`,
                whenOk: () => {
                    this.checkTypeReference(tr.type1, enclosingConcept),
                    this.checkTypeReference(tr.type2, enclosingConcept)  
                }
            })
    }

    checkTypeReference(typeRef: TypeReference, enclosingConcept:PiLangConceptReference) {
        // Note that there are two possible outcomes of the parser, which have to be changed into one.
        // Either 'sourceName' represents the 'XXX' in "XXX.yyy" or 'yyy' in "yyy".
        // Either 'partName' represents the 'yyy' in "XXX.yyy" or 'null' in "yyy".
        if (!!typeRef.partName) {
            // now we are sure that the parsed string was of the form 'XXX.yyy'
            this.checkConceptReference(typeRef.sourceName);
            // see note in checkConceptReference
            typeRef.partName.language = this.language;
            typeRef.partName.concept = typeRef.sourceName;
            this.checkPropertyReference(typeRef.partName);
        } else {
            // in this case the parsed string was of the form 'yyy' and represents a property 
            // of the concept for which the rule was specified
            typeRef.partName = new PiLangPropertyReference();
            typeRef.partName.name = typeRef.sourceName.name;
            typeRef.partName.language = this.language;
            typeRef.partName.concept = enclosingConcept;
            typeRef.sourceName = null;
            this.checkPropertyReference(typeRef.partName);
        }
    }

    checkPropertyReference(propRef: PiLangPropertyReference) {
        this.nestedCheck(
            {
                check: propRef.name !== undefined,
                error: `Property reference should have a name, but doesn't`,
                whenOk: () => this.nestedCheck(
                    {
                        check: propRef.property() !== undefined,
                        error: `PropertyReference to ${propRef.name} cannot be resolved`
                    })
            })
    }

    checkNotEmptyRule(nr: NotEmptyRule) {
        this.checkPropertyReference(nr.property);
    }
}

