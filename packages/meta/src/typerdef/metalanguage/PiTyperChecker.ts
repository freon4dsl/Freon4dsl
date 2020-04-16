import { Checker } from "../../utils/Checker";
import { PiLanguageUnit, PiLangConcept, PiLangProperty } from "../../languagedef/metalanguage/PiLanguage";
import { PiTypeDefinition, PiTypeRule, PiTypeIsTypeRule, PiTypeAnyTypeRule, PiTypeConceptRule, PiTypeStatement } from "./PiTyperDefLang";
import { PiLanguageExpressionChecker } from "../../languagedef/metalanguage/PiLanguageExpressionChecker";
import { PiLogger } from "../../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("PiTyperChecker"); // .mute();
export class PiTyperChecker extends Checker<PiTypeDefinition> {
    definition: PiTypeDefinition;
    myExpressionChecker : PiLanguageExpressionChecker;
    
    constructor(language: PiLanguageUnit) {
        super(language);
        this.myExpressionChecker = new PiLanguageExpressionChecker(this.language);
    }

    public check(definition: PiTypeDefinition): void {
        this.definition = definition;
        LOGGER.log("Checking typer definition '" + definition.name + "'");

        if( !!this.language ) {
            if( !!definition ) {
                this.nestedCheck(
                    {
                        check: this.language.name === definition.languageName,
                        error:  `Language reference ('${definition.languageName}') in Test expression checker does not match language '${this.language.name}' `+
                                `[line: ${definition.location?.start.line}, column: ${definition.location?.start.column}].`,
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
        LOGGER.log("Checking checkTyperRule '" + rule.toPiString() + "'");
        if (rule instanceof PiTypeIsTypeRule) {
            this.checkIsTypeRule(rule);
        } else if (rule instanceof PiTypeAnyTypeRule) {
            this.checkAnyTypeRule(rule);
        } else if (rule instanceof PiTypeConceptRule) {
            this.checkConceptRule(rule);
        }        
    }    

    private checkConceptRule(rule: PiTypeConceptRule) {
        LOGGER.log("Checking checkConceptRule '" + rule.toPiString() + "'");
        this.myExpressionChecker.checkConceptReference(rule.conceptRef);
        
        for( let stat of rule.statements) {
            this.checkStatement(stat, rule.conceptRef.referedElement());
        }
    }

    private checkIsTypeRule(rule: PiTypeIsTypeRule) {
        LOGGER.log("Checking checkIsTypeRule '" + rule.toPiString() + "'");
        let first = true;
        for (let t of rule.types) {
            this.myExpressionChecker.checkConceptReference(t);
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
        }
    }
}

