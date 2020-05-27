import { Checker } from "../../utils/Checker";
import { PiLanguageUnit, PiConcept, PiProperty, PiClassifier, PiInterface } from "../../languagedef/metalanguage/PiLanguage";
import { PiTypeDefinition, PiTypeRule, PiTypeIsTypeRule, PiTypeAnyTypeRule, PiTypeConceptRule, PiTypeStatement } from "./PiTyperDefLang";
import { PiLanguageExpressionChecker } from "../../languagedef/metalanguage/PiLanguageExpressionChecker";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";
import { PiLangUtil } from "../../languagedef/metalanguage";

const LOGGER = new PiLogger("PiTyperChecker").mute();
const infertypeName = "infertype";

export class PiTyperChecker extends Checker<PiTypeDefinition> {
    definition: PiTypeDefinition;
    myExpressionChecker : PiLanguageExpressionChecker;
    typeConcepts: PiClassifier[] = [];         // all concepts marked as 'isType'
    conceptsWithRules: PiClassifier[] = [];    // all concepts for which a rule is found. Used to check whether there are two rules for the same concept.
    
    constructor(language: PiLanguageUnit) {
        super(language);
        this.myExpressionChecker = new PiLanguageExpressionChecker(this.language);
    }

    public check(definition: PiTypeDefinition): void {
        this.definition = definition;
        LOGGER.log("Checking typer definition '" + definition.name + "'");

        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Typer definition checker does not known the language.`);
        }

        this.nestedCheck(
            {
                check: this.language.name === definition.languageName,
                error:  `Language reference ('${definition.languageName}') in Test expression checker does not match language '${this.language.name}' `+
                    `[line: ${definition.location?.start.line}, column: ${definition.location?.start.column}].`,
                whenOk: () => {
                    definition.language = this.language;
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
        this.myExpressionChecker.checkClassifierReference(rule.conceptRef);
        if (!!rule.conceptRef.referred) { // error messages done by myExpressionChecker
            let classifier = rule.conceptRef.referred;

            this.nestedCheck({
                check: !this.conceptsWithRules.includes(classifier),
                error: `Found a second entry for ${classifier.name} [line: ${rule.location?.start.line}, column: ${rule.location?.start.column}].`,
                whenOk: () => {
                    this.conceptsWithRules.push(classifier);
                    for( let stat of rule.statements) {
                        this.checkStatement(stat, classifier);
                    }
                }
            });
        }
    }

    private checkIsTypeRule(rule: PiTypeIsTypeRule) {
        LOGGER.log("Checking checkIsTypeRule '" + rule.toPiString() + "'");
        let first = true;
        let typeroot: PiClassifier;
        for (let t of rule.types) {
            this.myExpressionChecker.checkClassifierReference(t);
            this.typeConcepts.push(t.referred);
            if (first) {
                this.definition.typeroot = t;
                typeroot = t.referred;
                first = false;
            } else {
                // check the new type against the root of the type hierarchy
                // there are two assumptions: (1) the typeroot is the common super concept of all types
                // or (2) the typeroot is an interface that is implemented by all types
                if (typeroot instanceof PiConcept) { // check (1)
                    let base = PiLangUtil.superConcepts(t.referred);
                    this.simpleCheck(base.includes(typeroot), `The root type concept (${typeroot.name}) should be a base concept of '${t.referred.name}' `
                        + `[line: ${t.location?.start.line}, column: ${t.location?.start.column}].`);
                } else if (typeroot instanceof PiInterface) { // check (2)
                    let base = t.referred.allInterfaces();
                    this.simpleCheck(base.includes(typeroot), `The root type interface (${typeroot.name}) should be implemented by '${t.referred.name}' `
                        + `[line: ${t.location?.start.line}, column: ${t.location?.start.column}].`);
                }
            }
        }
    }

    private checkAnyTypeRule(rule: PiTypeAnyTypeRule) {
        LOGGER.log("Checking checkAnyTypeRule '" + rule.toPiString() + "'");
        let myTypes : PiConcept[] = [];
        for (let r of this.definition.typerRules) {
            if ( r instanceof PiTypeIsTypeRule ) {
                for ( let t of r.types ) {
                    myTypes.push( t.referred );
                }
            }
        }
    }

    private checkStatement(stat: PiTypeStatement, enclosingConcept: PiClassifier, predefined?: PiProperty[]) {
        LOGGER.log("Checking checkStatement '" + stat.toPiString() + "'");
        if (stat.isAbstract) {
            this.simpleCheck(stat.exp == null,
                `An abstract rule may not be defined [line: ${stat.location?.start.line}, column: ${stat.location?.start.column}].`)
        } else if (!!enclosingConcept && stat.exp) {
            this.myExpressionChecker.checkLangExp(stat.exp, enclosingConcept);
            if ( stat.statementtype === infertypeName ) {
                this.simpleCheck(!this.typeConcepts.includes(enclosingConcept),
                    `${enclosingConcept.name} is a type itself, and cannot have an inference rule `+
                    `[line: ${stat.location?.start.line}, column: ${stat.location?.start.column}].`);
            }
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

