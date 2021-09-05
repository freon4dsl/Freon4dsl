import {
    PiBinaryExpressionConcept,
    PiClassifier,
    PiConcept, PiExpressionConcept,
    PiInterface,
    PiLanguage,
    PiLimitedConcept, PiPrimitiveProperty, PiProperty
} from "../../../languagedef/metalanguage";
import {
    ListJoinType,
    PiEditConcept,
    PiEditInstanceProjection,
    PiEditProjectionItem, PiEditProjectionText,
    PiEditPropertyProjection,
    PiEditSubProjection,
    PiEditUnit
} from "../../metalanguage";
import { LangUtil, Names } from "../../../utils";
import { GrammarTemplate, referencePostfix } from "./GrammarTemplate";
import { SyntaxAnalyserTemplate } from "./SyntaxAnalyserTemplate";

export class ParserGenerator {
    private language: PiLanguage = null;
    private unit: PiConcept = null;
    private conceptsUsed: PiConcept[] = [];
    private binaryConceptsUsed: PiBinaryExpressionConcept[] = [];
    private interfacesAndAbstractsUsed: PiClassifier[] = [];
    private typesReferred: PiClassifier[] = [];
    private limitedsReferred: PiLimitedConcept[] = [];
    private generatedParseRules: string[] = [];
    private generatedSyntaxAnalyserMethods: string[] = [];
    private branchNames: string[] = [];
    private imports: PiClassifier[] = [];
    private specialBinaryRuleName = `__pi_binary_expression`;

    generateParserForUnit(language: PiLanguage, langUnit: PiConcept, editUnit: PiEditUnit) {
        // reset all attributes that are global to this class
        this.reset();
        this.language = language;
        this.unit = langUnit;
        // analyse the language unit and store the results in the global attributes
        this.analyseUnit(langUnit, []);
        // do the concepts
        this.generateConcepts(editUnit);
        // do the interfaces
        this.generateChoiceRules();
        // do the referred types
        this.generateReferences(editUnit);
        // do the binary expressions
        this.generateBinaryExpressions(language, editUnit);
    }

    getGrammarContent() : string {
        const grammarTemplate: GrammarTemplate = new GrammarTemplate();
        return grammarTemplate.generateGrammar(Names.language(this.language), Names.concept(this.unit), this.generatedParseRules);
    }

    getSyntaxAnalyserContent(relativePath: string) : string {
        const analyserTemplate: SyntaxAnalyserTemplate = new SyntaxAnalyserTemplate();
        const imports: string[] = this.imports.map(concept => Names.classifier(concept));
        return analyserTemplate.generateSyntaxAnalyser(this.language, this.branchNames, imports, this.generatedSyntaxAnalyserMethods, relativePath);
    }

    private reset() {
        this.language = null;
        this.unit = null;
        this.conceptsUsed = [];
        this.binaryConceptsUsed = [];
        this.interfacesAndAbstractsUsed = [];
        this.typesReferred = [];
        this.limitedsReferred = [];
        this.generatedParseRules = [];
        this.generatedSyntaxAnalyserMethods = [];
        this.branchNames = [];
        this.imports = [];
    }

    private analyseUnit(piClassifier: PiClassifier, typesDone: PiClassifier[]) {
        // make sure this classifier is not visited twice
        if (typesDone.includes(piClassifier)) {
            return;
        } else {
            typesDone.push(piClassifier);
        }

        // determine in which list the piClassifier belongs
        if (piClassifier instanceof PiInterface) {
            this.interfacesAndAbstractsUsed.push(piClassifier);
            // for interfaces search all implementors and subinterfaces
            LangUtil.findAllImplementorsAndSubs(piClassifier).forEach(type => {
                this.analyseUnit(type, typesDone);
            });
        } else if (piClassifier instanceof PiConcept) {
            if (piClassifier instanceof PiLimitedConcept) {
                this.limitedsReferred.push(piClassifier);
            } else if (piClassifier instanceof PiBinaryExpressionConcept) {
                if (!piClassifier.isAbstract) {
                    this.binaryConceptsUsed.push(piClassifier);
                }
            } else {
                if (!piClassifier.isModel) {
                    // A complete model can not be parsed, only its units can be parsed separately
                    if (piClassifier.isAbstract) {
                        this.interfacesAndAbstractsUsed.push(piClassifier);
                    } else {
                        this.conceptsUsed.push(piClassifier);
                    }
                }
            }

            // for any concept: add all direct subconcepts
            piClassifier.allSubConceptsDirect().forEach(type => {
                this.analyseUnit(type, typesDone);
            });
            // for any non-abstract concept: include all types of parts
            if (!piClassifier.isAbstract) {
                piClassifier.allParts().forEach(part => {
                    const type = part.type.referred;
                    this.analyseUnit(type, typesDone);
                });
                // and add all types of references to typesReferred
                piClassifier.allReferences().forEach(part => {
                    const type = part.type.referred;
                    if (!this.typesReferred.includes(type)) {
                        this.typesReferred.push(type);
                    }
                });
            }
        }
    }

    private generateBinaryExpressions(language:PiLanguage, editUnit: PiEditUnit) {
        // common information
        const expressionBase: PiExpressionConcept = language.findExpressionBase();
        const editDefs: PiEditConcept[] = this.findEditDefs(this.binaryConceptsUsed, editUnit);
        const branchName = this.specialBinaryRuleName;

        // parse rule(s)
        this.addToImports(expressionBase);
        const rule1: string = `${branchName} = [${Names.concept(expressionBase)} / __pi_binary_operator]2+`;
        const rule2: string = `leaf __pi_binary_operator = ${editDefs.map(def => `${def.symbol}`).join(" | ")}`
        this.generatedParseRules.push(rule1);
        this.generatedParseRules.push(rule2);

        // to be used as part of the if-statement in transformBranch()
        this.branchNames.push(branchName);

        // syntax analysis method(s)
        // TODO get the right type for 'BinaryExpression' in stead of ${Names.concept(expressionBase)}

        this.addToImports(this.binaryConceptsUsed);
        this.generatedSyntaxAnalyserMethods.push(`
        /**
         * Generic method to transform binary expressions.
         * Binary expressions are parsed according to these rules:
         * ${rule1}
         * ${rule2}
         *
         * In this method we build a skewed tree, which in a later phase needs to be balanced
         * according to the priorities of the operators.
         * @param branch
         * @private
         */
        private transform${branchName}(branch: SPPTBranch) : ${Names.concept(expressionBase)} {
            const children = branch.nonSkipChildren.toArray();
            const actualList = children[0].nonSkipChildren.toArray();
            let index = 0;
            let first = this.transformNode(actualList[index++]);
            while (index < actualList.length) {
                let operator = this.transformNode(actualList[index++]);
                let second = this.transformNode(actualList[index++]);
                let combined: ${Names.concept(expressionBase)} = null;
                switch (operator) {
                ${editDefs.map(def => `
                    case '${def.symbol}': {
                        combined = ${Names.concept(def.concept.referred)}.create({left: first, right: second});
                        break;
                    }`).join("")}
                    default: {
                        combined = null;
                    }
                }
                first = combined;
            }
            return first;
        }`);
    }

    private generateReferences(editUnit: PiEditUnit) {
        // parse rule(s)
        for (const piClassifier of this.typesReferred) {
            let rule: string = "";
            // take care of the special projection for a limited concept
            if (piClassifier instanceof PiLimitedConcept) {
                // see if there is a projection defined
                const conceptEditor = editUnit.findConceptEditor(piClassifier);
                if (conceptEditor) {
                    // make a rule according to the projection
                    rule = this.makeInstanceReferenceRule(piClassifier, conceptEditor);
                }
            }
            // no special projection then make a 'normal' rule
            if (rule.length == 0) {
                rule = `${Names.classifier(piClassifier)}${referencePostfix} = identifier`;
            }
            this.generatedParseRules.push(rule);
        }
        // syntax analysis method(s)
        // are not needed, because there is a generic method for references in the template
    }

    private makeInstanceReferenceRule(piClassifier: PiLimitedConcept, conceptEditor: PiEditConcept) {
        const myName = Names.classifier(piClassifier);
        let noResult = false;
        let result: string = `${myName}${referencePostfix} = `;
        conceptEditor.projection.lines.forEach((line, index) => {
            line.items.forEach(item => {
                if (item instanceof PiEditInstanceProjection) {
                    result += `"${item.keyword}" `;
                } else if (item instanceof PiEditPropertyProjection) {
                    // TODO do we allow other projections for limited concepts????
                    noResult = true;
                }
            });
            if (index < conceptEditor.projection.lines.length -1) {
                result += "\n\t/ ";
            }
        });
        if (noResult) {
            return "";
        } else {
            return result + "\n";
        }
    }

    // for interfaces we create a parse rule that is a choice between all classifiers that either implement or extend the interface
    // because limited concepts can only be used as reference, these are excluded for this choice
    // we also need to filter out the interface itself
    // the same is done for abstract concepts
    private generateChoiceRules() {
        for (const piClassifier of this.interfacesAndAbstractsUsed) {
            // parse rule(s)
            const branchName = Names.classifier(piClassifier);
            let implementors: PiClassifier[] = [];
            if (piClassifier instanceof PiInterface) {
                implementors.push(...piClassifier.allSubInterfacesDirect());
                implementors.push(...LangUtil.findImplementorsDirect(piClassifier).filter(sub => !(sub instanceof PiLimitedConcept)));
            } else if (piClassifier instanceof PiConcept) {
                implementors = piClassifier.allSubConceptsDirect().filter(sub => !(sub instanceof PiLimitedConcept));
            }

            let rule: string = "";
            if (implementors.length > 0) {
                // normal choice rule
                rule = `${branchName} = ${implementors.map(implementor =>
                    `${Names.classifier(implementor)} `).join("\n    | ")}`;

                // test to see if there is a binary concept here
                let implementorsNoBinaries = implementors.filter(sub => !(sub instanceof PiBinaryExpressionConcept));
                if (implementors.length != implementorsNoBinaries.length) {
                    // override the choice rule to exclude binary expression concepts
                    rule = `${branchName} = ${implementorsNoBinaries.map(implementor =>
                        `${Names.classifier(implementor)} `).join("\n    | ")}`;
                    // add the special binary concept rule as choice
                    rule += `\n    | ${this.specialBinaryRuleName}`

                }
                this.generatedParseRules.push(rule);
            } else {
                this.generatedParseRules.push(`${branchName} = "ERROR: there are no concepts that implement this interface or extends this abstract concept."`);
            }

            // to be used as part of the if-statement in transformBranch()
            this.branchNames.push(branchName);

            // syntax analysis methods
            this.addToImports(piClassifier);
            this.generatedSyntaxAnalyserMethods.push(`
            /**
             * Method to transform branches that match the following rule:
             * ${branchName} = ...
             * @param branch
             * @private
             */
            private transform${branchName}(branch: SPPTBranch) : ${Names.classifier(piClassifier)} {
                return this.transformNode(branch.nonSkipChildren.toArray()[0]);
            }`);
        }
    }

    private addToImports(extra: PiClassifier | PiClassifier[]) {
        if (Array.isArray(extra)) {
            for (const ext of extra) {
                if (!this.imports.includes(ext)) {
                    this.imports.push(ext);
                }
            }
        } else if (!this.imports.includes(extra)) {
            this.imports.push(extra);
        }
    }

    private generateConcepts(editUnit: PiEditUnit) {
        for (const piClassifier of this.conceptsUsed) {
            // find editDef for this concept
            const conceptDef: PiEditConcept = editUnit.findConceptEditor(piClassifier);
            const branchName = Names.classifier(piClassifier);
            // determine which properties of the concept will get a value through this parse rule
            const propsToSet: PiProperty[] = this.findPropsToSet(conceptDef);
            let indexToName: Map<string, number> = new Map<string, number>();
            let rule: string = "";

            // see if this concept has subconcepts
            const subs = piClassifier.allSubConceptsDirect();
            let choiceBetweenSubconcepts = "";
            if (subs.length > 0) {
                // TODO see if there are binary expressions amongst the implementors
                choiceBetweenSubconcepts = ` ${subs.map((implementor, index) =>
                    `${Names.classifier(implementor)} `).join("\n\t/ ")}\n\t| `;
            }

            // now we have enough information to create the parse rule
            // which is a choice between the rules for the direct sub-concepts
            // and a rule where every property mentioned in the editor definition is set.
            rule = `${branchName} =${choiceBetweenSubconcepts} ${conceptDef.projection.lines.map(l =>
                `${this.doAllItems(l.items, indexToName)}`
            ).join("\n\t")}`
            this.generatedParseRules.push(rule);

            this.branchNames.push(branchName);

            // Syntax analysis
            this.addToImports(piClassifier);
            const method: string =
            `
            /**
             * Method to transform branches that match the following rule:
             * ${rule}
             * @param branch
             * @private
             */
            private transform${branchName} (branch: SPPTBranch) : ${branchName} {
                const children = branch.nonSkipChildren.toArray();
                ${propsToSet.map(prop => `const ${prop.name} = this.transformNode(children[${indexToName.get(prop.name)}]);`).join("\n")}
       
                return ${Names.concept(piClassifier)}.create({${propsToSet.map(prop => `${prop.name}:${prop.name}`).join(", ")}});
            }`

            this.generatedSyntaxAnalyserMethods.push(method);
        }
    }

    private findPropsToSet(conceptDef: PiEditConcept): PiProperty[] {
        const propsToSet: PiProperty[] = [];

        conceptDef.projection.lines.forEach(l => {
            l.items.forEach(item => {
                if (item instanceof PiEditPropertyProjection) {
                    propsToSet.push(item.expression.findRefOfLastAppliedFeature());
                }
                if (item instanceof PiEditSubProjection) {
                    item.items.forEach(sub => {
                        if (sub instanceof PiEditPropertyProjection) {
                            propsToSet.push(sub.expression.findRefOfLastAppliedFeature());
                        }
                    });
                }
            });
        });
        return propsToSet;
    }

    private doAllItems(list: PiEditProjectionItem[], indexToName: Map<string, number>): string {
        let result = "";
        if (!!list && list.length > 0) {
            list.forEach((item, index) => {
                if (item instanceof PiEditProjectionText) {
                    result += `${this.makeTextProjection(item)}`
                } else if (item instanceof PiEditPropertyProjection) {
                    let propName: string = item.expression.findRefOfLastAppliedFeature().name;
                    result += `${this.makePropertyProjection(item, propName)} `
                    indexToName.set(propName, index);
                } else if (item instanceof PiEditSubProjection) {
                    result += `${this.makeSubProjection(item, index, indexToName)} `
                }
            });
        }
        return result;
    }

    private makeSubProjection(item: PiEditSubProjection, mainIndex: number, indexToName: Map<string, number>): string {
        // TODO check: I expect only one property projection in a sub projection
        if (item.optional) {
            let parseText = "";
            let propName = "";
            item.items.forEach((sub, index) => {
                if (sub instanceof PiEditSubProjection) {
                    parseText += this.makeSubProjection(sub, mainIndex+index, indexToName);
                }
                if (sub instanceof PiEditPropertyProjection) {
                    propName = sub.expression.findRefOfLastAppliedFeature().name;
                    parseText += `${this.makePropertyProjection(sub, propName)}`;
                    indexToName.set(propName, mainIndex+index);
                }
                if (sub instanceof PiEditProjectionText) {
                    parseText += `${this.makeTextProjection(sub)}`;
                }
            });
            return `${parseText}?`;
        } else {
            // TODO check whether the mainIndex needs to be passed
            return `${this.doAllItems(item.items, indexToName)}`;
        }
    }

    private makePropertyProjection(item: PiEditPropertyProjection, variableName: string): string {
        const myElem = item.expression.findRefOfLastAppliedFeature();
        if (!!myElem) {
            let propTypeName = Names.classifier(myElem.type.referred);
            if (myElem.isList) {
                let propEntry: string = "";
                let joinText = this.makeListJoinText(item.listJoin?.joinText);

                // joinText can be (1) separator, (2) terminator, or (3) empty
                if (joinText.length == 0) {
                    propEntry = `${propTypeName}*`;
                } else if (item.listJoin?.joinType === ListJoinType.Separator) {
                    propEntry = `[${propTypeName} / "${joinText}" ]*`;
                } else if (item.listJoin?.joinType === ListJoinType.Terminator) {
                    propEntry = `(${propTypeName} "${joinText}" )*`
                }
                return propEntry;
            } else {
                if (myElem instanceof PiPrimitiveProperty) {
                    const typeName = this.makeTypeName(myElem, item);
                    return `${typeName}`;
                } else {
                    if (myElem.isPart) {
                        return `${propTypeName}`;
                    } else { // the property is a reference
                        return `${propTypeName}${referencePostfix}`;
                    }
                }
            }
        } else {
            return "";
        }
    }

    private makeTextProjection(item: PiEditProjectionText): string {
        // TODO escape all quotes in a text string in a PiEditProjectionText
        // const escaped = trimmed.split("\"").join("\\\"");
        const trimmed = item.text.trim();
        let splitted: string[];
        if (trimmed.includes(" ")) { // we need to add a series of texts with whitespace between them
            splitted = trimmed.split(" ");
            let result: string = "";
            splitted.forEach(str => {
                result += `\'${str}\' `
            });
            return result;
        } else {
            return `\'${trimmed}\' `;
        }
    }

    private makeListJoinText(joinText: string): string {
        let result: string = "";
        if (!!joinText) {
            result = joinText.trimRight();
        }
        // TODO should test on all manners of whitespace
        if (result == "\\n" || result == "\\n\\n" || result == "\\t" || result == "\\r") {
            result = "";
        }
        return result;
    }

    private makeTypeName(myElem: PiPrimitiveProperty, item: PiEditPropertyProjection): string {
        // TODO make a difference between variables and stringLiterals in the .ast file
        let typeName: string = "";
        if (myElem.name === "name") {
            typeName = "identifier";
        } else {
            switch (myElem.primType) {
                case "string": {
                    typeName = "stringLiteral";
                    break;
                }
                case "number": {
                    typeName = "numberLiteral";
                    break;
                }
                case "boolean": {
                    if (!!item.keyword) {
                        typeName = `"${item.keyword}"`
                    } else {
                        typeName = "booleanLiteral";
                    }
                    break;
                }
                default:
                    typeName = "stringLiteral";
            }
        }
        return typeName;
    }

    private findEditDefs(binaryConceptsUsed: PiBinaryExpressionConcept[], editUnit: PiEditUnit): PiEditConcept[] {
        let result: PiEditConcept[] = [];
        for (const binCon of binaryConceptsUsed) {
            result.push(editUnit.findConceptEditor(binCon));
        }
        return result;
    }
}
