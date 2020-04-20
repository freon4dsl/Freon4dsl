import { Checker } from "../../utils/Checker";
import { PiLanguageUnit, PiLangConcept, PiLangProperty, PiLangClass } from "../../languagedef/metalanguage/PiLanguage";
import { PiTypeDefinition, PiTypeRule, PiTypeIsTypeRule, PiTypeAnyTypeRule, PiTypeConceptRule, PiTypeStatement } from "./PiTyperDefLang";
import { PiLanguageExpressionChecker } from "../../languagedef/metalanguage/PiLanguageExpressionChecker";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiLangConceptReference } from "../../languagedef/metalanguage";

const LOGGER = new PiLogger("PiTyperChecker").mute();
export class PiTyperChecker extends Checker<PiTypeDefinition> {
    definition: PiTypeDefinition;
    myExpressionChecker : PiLanguageExpressionChecker;
    typeConcepts: PiLangConcept[] = [];         // all concepts marked as 'isType'
    conceptsWithRules: PiLangConcept[] = [];    // all concepts for which a rule is found. Used to check whether there are two rules for the same concept.
    
    constructor(language: PiLanguageUnit) {
        super(language);
        this.myExpressionChecker = new PiLanguageExpressionChecker(this.language);
    }

    public check(definition: PiTypeDefinition): void {
        this.definition = definition;
        LOGGER.log("Checking typer definition '" + definition.name + "'");

        if( !!this.language ) {
            this.nestedCheck(
                {
                    check: this.language.name === definition.languageName,
                    error:  `Language reference ('${definition.languageName}') in Test expression checker does not match language '${this.language.name}' `+
                        `[line: ${definition.location?.start.line}, column: ${definition.location?.start.column}].`,
                    whenOk: () => {
                        // sort out the different types of rules
                        this.sortRules(definition);
                        definition.typerRules.forEach(rule => {
                            this.checkTyperRule(rule);
                        });
                        definition.conceptRules.forEach(rule => {
                            this.checkConceptRule(rule);
                        });
                    }
                });
            // TODO add check on double rules for the same concept
        } else {
            LOGGER.error(this, "Typer Definition checker does not known the language, exiting.");
            process.exit(-1);
        }
        this.errors = this.errors.concat(this.myExpressionChecker.errors);
   }

    private checkTyperRule(rule: PiTypeRule) {
        LOGGER.log("Checking checkTyperRule '" + rule.toPiString() + "'");
        if (rule instanceof PiTypeIsTypeRule) {
            this.checkIsTypeRule(rule);
        } else if (rule instanceof PiTypeAnyTypeRule) {
            this.checkAnyTypeRule(rule);
        } else if (rule instanceof PiTypeConceptRule) {
            // should never be called, because the rules are sorted before this method is called
            this.checkConceptRule(rule);
        }
    }    

    private checkConceptRule(rule: PiTypeConceptRule) {
        LOGGER.log("Checking checkConceptRule '" + rule.toPiString() + "'");
        this.myExpressionChecker.checkConceptReference(rule.conceptRef);
        if (!!rule.conceptRef.referedElement()) { // error messages done by myExpressionChecker
            let myConcept = rule.conceptRef.referedElement();
            this.nestedCheck({
                check: !this.conceptsWithRules.includes(myConcept),
                error: `Found a second entry for ${myConcept.name} [line: ${rule.location?.start.line}, column: ${rule.location?.start.column}].`,
                whenOk: () => {
                    this.conceptsWithRules.push(myConcept);
                    for( let stat of rule.statements) {
                        this.checkStatement(stat, myConcept);
                    }
                }
            });
        }
    }

    private checkIsTypeRule(rule: PiTypeIsTypeRule) {
        LOGGER.log("Checking checkIsTypeRule '" + rule.toPiString() + "'");
        let first = true;
        for (let t of rule.types) {
            this.myExpressionChecker.checkConceptReference(t);
            this.typeConcepts.push(t.referedElement());
            if (first) {
                this.definition.typeroot = t;
                first = false;
            }
        }
    }

    private checkAnyTypeRule(rule: PiTypeAnyTypeRule) {
        LOGGER.log("Checking checkAnyTypeRule '" + rule.toPiString() + "'");
        let myTypes : PiLangConcept[] = [];
        for (let r of this.definition.typerRules) {
            if ( r instanceof PiTypeIsTypeRule ) {
                for ( let t of r.types ) {
                    myTypes.push( t.referedElement() );
                }
            }
        }
    }

    private checkStatement(stat: PiTypeStatement, enclosingConcept: PiLangConcept, predefined?: PiLangProperty[]) {
        LOGGER.log("Checking checkStatement '" + stat.toPiString() + "'");
        if (stat.isAbstract) {
            this.simpleCheck(stat.exp == null, `An abstract rule may not be defined [line: ${stat.location?.start.line}, column: ${stat.location?.start.column}].`)
        } else if (!!enclosingConcept && stat.exp) {
            this.myExpressionChecker.checkLangExp(stat.exp, enclosingConcept);
            this.simpleCheck(!this.typeConcepts.includes(enclosingConcept),
                `${enclosingConcept.name} is a type itself, and cannot have an inference rule `+
                       `[line: ${stat.location?.start.line}, column: ${stat.location?.start.column}].`);
        }
    }

    private sortRules(definition: PiTypeDefinition) {
        let newTypeRules: PiTypeRule[] = [];
        let conceptRules: PiTypeConceptRule[] = [];
        // sort out the concept rules from the others
        for (let rule of definition.typerRules) {
            if (rule instanceof PiTypeConceptRule) {
                conceptRules.push(rule);
            } else {
                newTypeRules.push(rule);
            }
        }
        definition.typerRules = newTypeRules;
        definition.conceptRules = conceptRules;
    }

}

