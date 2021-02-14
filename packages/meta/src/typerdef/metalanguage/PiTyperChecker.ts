import { Checker } from "../../utils";
import { PiLanguage,
    PiConcept,
    PiClassifier,
    PiInterface,
    PiLangExpressionChecker,
    PiLangUtil } from "../../languagedef/metalanguage";
import { PiTypeDefinition, PiTypeRule, PiTypeIsTypeRule, PiTypeAnyTypeRule, PiTypeClassifierRule, PiTypeStatement } from "./PiTyperDefLang";
import { MetaLogger } from "../../utils/MetaLogger";

const LOGGER = new MetaLogger("PiTyperChecker").mute();
const infertypeName = "infertype";

export class PiTyperChecker extends Checker<PiTypeDefinition> {
    definition: PiTypeDefinition;
    myExpressionChecker: PiLangExpressionChecker;
    typeConcepts: PiClassifier[] = [];         // all concepts marked as 'isType'
    conceptsWithRules: PiClassifier[] = [];    // all concepts for which a rule is found.
                                               // Used to check whether there are two rules for the same concept.

    constructor(language: PiLanguage) {
        super(language);
        this.myExpressionChecker = new PiLangExpressionChecker(this.language);
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
                error:  `Language reference ('${definition.languageName}') in Test expression checker does not match language '${this.language.name}' ` +
                    `[line: ${definition.location?.start.line}, column: ${definition.location?.start.column}].`,
                whenOk: () => {
                    definition.language = this.language;
                    // sort out the different types of rules
                    this.sortRules(definition);
                    definition.typerRules.forEach(rule => {
                        this.checkTyperRule(rule);
                    });
                    definition.classifierRules.forEach(rule => {
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
        } else if (rule instanceof PiTypeClassifierRule) {
            // should never be called, because the rules are sorted before this method is called
           this.checkConceptRule(rule);
        }
    }

    private checkConceptRule(rule: PiTypeClassifierRule) {
        LOGGER.log("Checking checkConceptRule '" + rule.toPiString() + "'");
        this.myExpressionChecker.checkClassifierReference(rule.conceptRef);
        if (!!rule.conceptRef.referred) { // error messages done by myExpressionChecker
            const classifier = rule.conceptRef.referred;

            this.nestedCheck({
                check: !this.conceptsWithRules.includes(classifier),
                error: `Found a second entry for ${classifier.name} [line: ${rule.location?.start.line}, column: ${rule.location?.start.column}].`,
                whenOk: () => {
                    this.conceptsWithRules.push(classifier);
                    for ( const stat of rule.statements) {
                        this.checkStatement(stat, classifier);
                    }
                }
            });
        }
    }

    private checkIsTypeRule(rule: PiTypeIsTypeRule) {
        LOGGER.log("Checking checkIsTypeRule '" + rule.toPiString() + "'");
        let first = true;
        let typeroot: PiClassifier = null;
        for (const t of rule.types) {
            this.myExpressionChecker.checkClassifierReference(t);
            if (!!t.referred) { // error message given by myExpressionChecker
                this.typeConcepts.push(t.referred);
                if (first) {
                    this.definition.typeroot = t;
                    typeroot = t.referred;
                    first = false;
                    this.definition.types.push(t);
                } else {
                    // check the new type against the root of the type hierarchy
                    // there are two assumptions: (1) the typeroot is the common super concept of all types
                    // or (2) the typeroot is an interface that is implemented by all types
                    if (typeroot instanceof PiConcept) { // check (1)
                        const base = PiLangUtil.superConcepts(t.referred);
                        this.nestedCheck({
                            check: base.includes(typeroot),
                            error: `The root type concept (${typeroot.name}) should be a base concept of '${t.referred.name}' `
                                + `[line: ${t.location?.start.line}, column: ${t.location?.start.column}].`,
                            whenOk: () => {
                                this.definition.types.push(t);
                            }
                        });
                    } else if (typeroot instanceof PiInterface) { // check (2)
                        const base = PiLangUtil.superInterfaces(t.referred);
                        this.nestedCheck({
                            check: base.includes(typeroot),
                            error: `The root type interface (${typeroot.name}) should be implemented by '${t.referred.name}' `
                                + `[line: ${t.location?.start.line}, column: ${t.location?.start.column}].`,
                            whenOk: () => {
                                this.definition.types.push(t);
                            }
                        });
                    }
                }
            }
        }

    }

    private checkAnyTypeRule(rule: PiTypeAnyTypeRule) {
        LOGGER.log("Checking checkAnyTypeRule '" + rule.toPiString() + "'");
        // const myTypes: PiClassifier[] = [];
        for (const r of this.definition.typerRules) {
            if ( r instanceof PiTypeAnyTypeRule ) {
                // TODO see if there is anything to check
            }
        }
    }

    private checkStatement(stat: PiTypeStatement, enclosingConcept: PiClassifier) {
        LOGGER.log("Checking checkStatement '" + stat.toPiString() + "'");
        if (stat.isAbstract) {
            // because the following holds
            // undefined != null  // returns false
            // undefined !== null // returns true
            // we use this guard to the simple check
            this.simpleCheck(stat.exp === null || stat.exp === undefined,
                `An abstract rule may not be defined [line: ${stat.location?.start.line}, column: ${stat.location?.start.column}].`);
        } else if (!!enclosingConcept && stat.exp) {
            this.myExpressionChecker.checkLangExp(stat.exp, enclosingConcept);
            if ( stat.statementtype === infertypeName ) {
                this.simpleCheck(!this.typeConcepts.includes(enclosingConcept),
                    `${enclosingConcept.name} is a type itself, and cannot have an inference rule ` +
                    `[line: ${stat.location?.start.line}, column: ${stat.location?.start.column}].`);
            }
        }
    }

    private sortRules(definition: PiTypeDefinition) {
        const newTypeRules: PiTypeRule[] = [];
        const conceptRules: PiTypeClassifierRule[] = [];
        // sort out the concept rules from the others
        for (const rule of definition.typerRules) {
            if (rule instanceof PiTypeClassifierRule) {
                conceptRules.push(rule);
            } else {
                newTypeRules.push(rule);
            }
        }
        definition.typerRules = newTypeRules;
        definition.classifierRules = conceptRules;
    }
}
