import { Checker } from "../../utils";
import {
    PiLanguage,
    PiConcept,
    PiClassifier,
    PiInterface,
    PiLangExpressionChecker, PiElementReference
} from "../../languagedef/metalanguage";
import { PiTypeDefinition, PiTypeRule, PiTypeIsTypeRule, PiTypeAnyTypeRule, PiTypeClassifierRule, PiTypeStatement } from "./PiTyperDefLang";
import { MetaLogger } from "../../utils";

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

        // when everything has been checked we can check even more ...
        // let's find the top of the type hierarchy, if present
        this.findTypeRoot(definition);

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
        // let first = true;
        // let typeroot: PiClassifier = null;
        for (const t of rule.types) {
            this.myExpressionChecker.checkClassifierReference(t);
            if (!!t.referred) { // error message given by myExpressionChecker
                this.typeConcepts.push(t.referred);
                // if (first) {
                //     this.definition.typeroot = t;
                //     typeroot = t.referred;
                //     first = false;
                //     this.definition.types.push(t);
                // } else {
                //     // check the new type against the root of the type hierarchy
                //     // there are two assumptions: (1) the typeroot is the common super concept of all types
                //     // or (2) the typeroot is an interface that is implemented by all types
                //     if (typeroot instanceof PiConcept) { // check (1)
                //         const base = LangUtil.superConcepts(t.referred);
                //         this.nestedCheck({
                //             check: base.includes(typeroot),
                //             error: `The root type concept (${typeroot.name}) should be a base concept of '${t.referred.name}' `
                //                 + `[line: ${t.location?.start.line}, column: ${t.location?.start.column}].`,
                //             whenOk: () => {
                //                 this.definition.types.push(t);
                //             }
                //         });
                //     } else if (typeroot instanceof PiInterface) { // check (2)
                //         const base = LangUtil.superInterfaces(t.referred);
                //         this.nestedCheck({
                //             check: base.includes(typeroot),
                //             error: `The root type interface (${typeroot.name}) should be implemented by '${t.referred.name}' `
                //                 + `[line: ${t.location?.start.line}, column: ${t.location?.start.column}].`,
                //             whenOk: () => {
                //                 this.definition.types.push(t);
                //             }
                //         });
                //     }
                // }
            }
        }

    }

    private checkAnyTypeRule(rule: PiTypeAnyTypeRule) {
        LOGGER.log("Checking checkAnyTypeRule '" + rule.toPiString() + "'");
        // const myTypes: PiClassifier[] = [];
        for (const r of this.definition.typerRules) {
            if (r instanceof PiTypeAnyTypeRule) {
                r.statements.forEach(stat => {
                    // check the statement, using the overall model as enclosing concept
                    this.checkStatement(stat, this.language.modelConcept);
                });
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

    private findTypeRoot(definition: PiTypeDefinition) {
        const foundbaseConcepts: PiConcept[] = [];
        const foundbaseInterfaces: PiInterface[] = [];
        this.typeConcepts.forEach(type => {
            if (type instanceof PiInterface ) {
                this.addListIfNotPresent(foundbaseInterfaces, this.findBaseInterfaces(type));
            } else if (type instanceof PiConcept) {
                this.addIfNotPresent(foundbaseConcepts, this.findBaseConcept(type));
            }
        });
        // see whether any of the concepts implement one of the interfaces
        // if so we can skip the concept
        const remaining: PiConcept[] = [];
        foundbaseConcepts.forEach(concept => {
            let canSkip: boolean = false;
            concept.allInterfaces().forEach(intf => {
               if (foundbaseInterfaces.includes(intf)) {
                   canSkip = true;
               }
            });
            if (!canSkip) {
                remaining.push(concept);
            }
        });
        // now we have found all base classifiers
        if (foundbaseInterfaces.length + remaining.length > 1) { // there are multiple base types
            // create a new type as super of all of them

        } else {
            console.log("interfaces: " + foundbaseInterfaces.map(i => i.name).join(", "))
            console.log("concepts: " + remaining.map(i => i.name).join(", "))
            let baseType: PiClassifier = null;
            if (foundbaseInterfaces.length === 1) {
                baseType = foundbaseInterfaces[0];
            } else if (remaining.length === 1) {
                baseType = remaining[0];
            }
            if (!!baseType) {
                definition.typeroot = PiElementReference.create<PiClassifier>(baseType, "PiClassifier");
                definition.typeroot.owner = this.language;
            } else {
                console.log ("Internal error: no type root found");
            }
        }
    }

    private addIfNotPresent(list: PiClassifier[], toBeAdded: PiClassifier) {
        if (!list.includes(toBeAdded)) { // add if not present
            list.push(toBeAdded);
        }
    }

    private addListIfNotPresent(list: PiClassifier[], toBeAdded: PiClassifier[]) {
        toBeAdded.forEach(added => {
            if (!list.includes(added)) { // add if not present
                list.push(added);
            }
        })
    }

    private findBaseConcept(concept: PiConcept): PiConcept {
        if (!!concept.base && concept.base.referred instanceof PiConcept) {
            return this.findBaseConcept(concept.base.referred);
        } else {
            return concept;
        }
    }

    private findBaseInterfaces(piInterface: PiInterface): PiInterface[] {
        // console.log("doing interface " + piInterface.name);
        const result: PiInterface[] = [];
        if (piInterface.base.length > 0) {
            piInterface.base.forEach(b => {
                this.addListIfNotPresent(result, this.findBaseInterfaces(b.referred));
            });
        } else {
            this.addIfNotPresent(result, piInterface);
        }
        return result;
    }
}
