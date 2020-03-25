import { Checker } from "../../utils/Checker";
import { PiLanguageUnit, PiLangConcept } from "../../languagedef/metalanguage/PiLanguage";
import { PiTypeDefinition, PiTypeRule, PiTypeIsTypeRule, PiTypeAnyTypeRule, PiTypeConceptRule, PiTypeStatement } from "./PiTyperDefLang";
import { PiLanguageExpressionChecker } from "../../languagedef/metalanguage/PiLanguageExpressionChecker";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";

const LOGGER = new PiLogger("PiTyperChecker"); // .mute();
export class PiTyperChecker extends Checker<PiTypeDefinition> {
    verbose: boolean = false;
    definition: PiTypeDefinition;
    myExpressionChecker : PiLanguageExpressionChecker;
    
    constructor(language: PiLanguageUnit) {
        super();
        this.language = language;
        this.myExpressionChecker = new PiLanguageExpressionChecker(this.language);
    }

    public check(definition: PiTypeDefinition, verbose: boolean): void {
        this.verbose = verbose;
        this.definition = definition;
        if (verbose) LOGGER.log("Checking typer definition '" + definition.name + "'");

        if( !!this.language ) {
            if( !!definition ) {
                this.nestedCheck(
                    {
                        check: this.language.name === definition.languageName,
                        error: `Language reference ('${definition.languageName}') in Test expression checker does not match language '${this.language.name}'.`,
                        whenOk: () => {
                            definition.typerRules.forEach(rule => {    
                                this.checkTyperRule(rule);
                            });        
                        }
                    });
            } else {
                LOGGER.error(this, "Typer Definition checker does not known the definition, exiting.");
                process.exit(-1);
            }
        } else {
            LOGGER.error(this, "Typer Definition checker does not known the language, exiting.");
            process.exit(-1);
        }
        this.errors = this.errors.concat(this.myExpressionChecker.errors);
   }

    private checkTyperRule(rule: PiTypeRule) {
        if (rule instanceof PiTypeIsTypeRule) {
            this.checkIsTypeRule(rule);
        } else if (rule instanceof PiTypeAnyTypeRule) {
            this.checkAnyTypeRule(rule);
        } else if (rule instanceof PiTypeConceptRule) {
            this.checkConceptRule(rule);
        }        
    }    

    private checkConceptRule(rule: PiTypeConceptRule) {
        this.checkConceptReference(rule.conceptRef);
        
        for( let stat of rule.statements) {
            this.checkStatement(stat, rule.conceptRef.referedElement());
        }
    }

    private checkIsTypeRule(rule: PiTypeIsTypeRule) {
        for (let t of rule.types) {
            this.checkConceptReference(t);
        }
    }

    private checkAnyTypeRule(rule: PiTypeAnyTypeRule) {
        // TODO
        // find isTypeRule, make sure it is checked
        // for (let type of isTypeRule.types) {
        //  for( let stat of rule.statements) {
        //      this.checkStatement(stat, types.referedElement());
            // }
        // }
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

    private checkStatement(stat: PiTypeStatement, enclosingConcept: PiLangConcept) {
        if (stat.isAbstract) {
            this.simpleCheck(stat.exp == null, "An abstract rule may not be defined.")
        } else if (!!enclosingConcept && stat.exp) {
            this.myExpressionChecker.checkLangExp(stat.exp, enclosingConcept);
        }
    }
}

