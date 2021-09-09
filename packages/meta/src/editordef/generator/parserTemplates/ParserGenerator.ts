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
import { GrammarTemplate } from "./GrammarTemplate";
import { SyntaxAnalyserTemplate } from "./SyntaxAnalyserTemplate";
import { RefCorrectorTemplate } from "./RefCorrectorTemplate";

export const referencePostfix = "PiElemRef";
export const optionalRulePrefix = "_Optional";

export class ParserGenerator {
    private language: PiLanguage = null;
    private unit: PiConcept = null;
    private conceptsUsed: PiConcept[] = [];
    private binaryConceptsUsed: PiBinaryExpressionConcept[] = [];
    private interfacesAndAbstractsUsed: PiClassifier[] = [];
    private typesReferred: PiClassifier[] = [];
    // private limitedsReferred: PiLimitedConcept[] = [];
    private generatedParseRules: string[] = [];
    private generatedSyntaxAnalyserMethods: string[] = [];
    private branchNames: string[] = [];
    private imports: PiClassifier[] = [];
    private currentIndex = 0;
    private specialBinaryRuleName = `__pi_binary_expression`;
    private separatorToProp: Map<PiProperty, string> = new Map<PiProperty, string>();

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
        return analyserTemplate.generateSyntaxAnalyser(this.unit, this.branchNames, imports, this.generatedSyntaxAnalyserMethods, relativePath);
    }

    getRefCorrectorContent(relativePath: string): string {
        const refCorrectorMaker: RefCorrectorTemplate = new RefCorrectorTemplate();
        return refCorrectorMaker.makeCorrector(this.language, this.unit, this.interfacesAndAbstractsUsed, relativePath);
    }

    private reset() {
        this.language = null;
        this.unit = null;
        this.conceptsUsed = [];
        this.binaryConceptsUsed = [];
        this.interfacesAndAbstractsUsed = [];
        this.typesReferred = [];
        this.generatedParseRules = [];
        this.generatedSyntaxAnalyserMethods = [];
        this.branchNames = [];
        this.imports = [];
        this.currentIndex = 0;
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
                this.typesReferred.push(piClassifier);
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
        const rule2: string = `leaf __pi_binary_operator = ${editDefs.map(def => `'${def.symbol}'`).join(" | ")}`
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
         * In this method we build a crooked tree, which in a later phase needs to be balanced
         * according to the priorities of the operators.
         * @param branch
         * @private
         */
        private transform${branchName}(branch: SPPTBranch) : ${Names.concept(expressionBase)} {
            // console.log("transform${branchName} called");
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
        for (const piClassifier of this.typesReferred) {
            // parse rule(s)
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

    // for interfaces and abstract concepts we create a parse rule that is a choice between all classifiers
    // that either implement or extend the concept
    // because limited concepts can only be used as reference, these are excluded for this choice
    private generateChoiceRules() {
        for (const piClassifier of this.interfacesAndAbstractsUsed) {
            // parse rule(s)
            const branchName = Names.classifier(piClassifier);
            // find the choices for this rule: all concepts that implement or extend the concept
            let implementors: PiClassifier[] = [];
            if (piClassifier instanceof PiInterface) {
                implementors.push(...piClassifier.allSubInterfacesDirect());
                implementors.push(...LangUtil.findImplementorsDirect(piClassifier).filter(sub => !(sub instanceof PiLimitedConcept)));
            } else if (piClassifier instanceof PiConcept) {
                implementors = piClassifier.allSubConceptsDirect().filter(sub => !(sub instanceof PiLimitedConcept));
            }
            // sort the concepts: concepts that have literals in them should go last, because the parser treats them with priority
            implementors = this.sortImplementors(implementors);

            let rule: string = "";
            if (implementors.length > 0) {
                // normal choice rule
                rule = `${branchName} = ${implementors.map(implementor =>
                    `${Names.classifier(implementor)} `).join("\n    | ")}`;

                // test to see if there is a binary expression concept here
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
             * ${this.addCommentStars(rule)}
             * @param branch
             * @private
             */
            private transform${branchName}(branch: SPPTBranch) : ${Names.classifier(piClassifier)} {
                // console.log("transform${branchName} called");
                return this.transformNode(branch.nonSkipChildren.toArray()[0]);
            }`);
        }
    }

    private addToImports(extra: PiClassifier | PiClassifier[]) {
        if (!!extra) {
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
    }

    private generateConcepts(editUnit: PiEditUnit) {
        for (const piClassifier of this.conceptsUsed) {
            // find editDef for this concept
            const conceptDef: PiEditConcept = editUnit.findConceptEditor(piClassifier);
            const branchName = Names.classifier(piClassifier);
            // determine which properties of the concept will get a value through this parse rule
            // note: not all properties need to be present in a projection
            const propsToSet: PiProperty[] = this.findPropsToSet(conceptDef);
            let indexToName: Map<string, number> = new Map<string, number>();

            // make the parse rule
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
            // console.log(`doAllItems START`);
            this.currentIndex = 0;
            rule = `${branchName} =${choiceBetweenSubconcepts} ${conceptDef.projection.lines.map(l =>
                `${this.doAllItems(l.items, indexToName)}`
            ).join("\n\t")}`
            this.generatedParseRules.push(rule);

            // to be used as part of the if-statement in transformBranch()
            this.branchNames.push(branchName);

            // Syntax analysis
            this.addToImports(piClassifier);
            let propStatements: string[] = [];
            // different statements needed for (1) optional, (2) list, (3) reference props
            // thus we have 8 possibilities
            for (const prop of propsToSet) {
                // TODO sort this out => too messy
                const propType = prop.type.referred; // more efficient to determine 'referred' only once
                this.addToImports(propType);
                let propTypeName = (prop instanceof PiPrimitiveProperty)
                    ? `${prop.primType}`
                    : `${Names.classifier(propType)}`;
                let innerText: string = ""; // holds name of correct transform... method
                let separatorText: string = ""; // adds separator to call to transformList
                let extraParam: string = ""; // extra parameter to call to piElemRef to set the correct Type
                if (!prop.isList && prop.isPart) {          // (non-list, part)
                    innerText = `this.transformNode`;
                } else if (!prop.isList && !prop.isPart) {  // (non-list, reference)
                    innerText = `this.piElemRef<${Names.classifier(propType)}>`;
                    extraParam = `, "${Names.classifier(propType)}"`;
                    propTypeName = `${Names.PiElementReference}<${propTypeName}>`;
                } else if (prop.isList && prop.isPart) {   // (list, part)
                    innerText = `this.transformList<${propTypeName}>`;
                    let tmptext = this.separatorToProp.get(prop);
                    if (tmptext.length > 0) {
                        separatorText = `, "${tmptext}"`;
                    }
                    propTypeName = `${propTypeName}[]`;
                } else if (prop.isList && !prop.isPart) {    // (list, reference)
                    innerText = `this.transformList<${Names.PiElementReference}<${propTypeName}>>`;
                    propTypeName = `${Names.PiElementReference}<${propTypeName}>[]`;
                }

                if (prop.isOptional ) { // now take into account the optionality
                    propStatements.push(
                        `const ${prop.name}Node = children[${indexToName.get(prop.name)}] as SPPTBranch;
                        let ${prop.name} = null;
                        if (!${prop.name}Node.isEmptyMatch) {
                            // transform the first element in the [0..1] optional collection
                            ${prop.name} = ${innerText}(${prop.name}Node.nonSkipChildren.toArray()[0]${extraParam});
                        }`);
                } else {
                    propStatements.push(`const ${prop.name}: ${propTypeName} = ${innerText}(children[${indexToName.get(prop.name)}]${separatorText}${extraParam});`);
                }
            }

            const method: string =
            `
            /**
             * Method to transform branches that match the following rule:
             * ${this.addCommentStars(rule)}
             * @param branch
             * @private
             */
            private transform${branchName} (branch: SPPTBranch) : ${branchName} {
                // console.log("transform${branchName} called");
                const children = branch.nonSkipChildren.toArray();               
                ${propStatements.map(stat => `${stat}`).join("\n")}      
                return ${Names.concept(piClassifier)}.create({${propsToSet.map(prop => `${prop.name}:${prop.name}`).join(", ")}});
            }`;

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
        // console.log(`doAllItems.mainIndex: ${this.currentIndex}`)
        let result = "";
        if (!!list && list.length > 0) {
            list.forEach((item, index) => {
                if (item instanceof PiEditProjectionText) {
                    result += `${this.makeTextProjection(item)}`
                } else if (item instanceof PiEditPropertyProjection) {
                    let propName: string = item.expression.findRefOfLastAppliedFeature().name;
                    result += `${this.makePropertyProjection(item)} `
                    // console.log(`settingIndex: ${propName} => ${this.currentIndex}`);
                    indexToName.set(propName, this.currentIndex);
                } else if (item instanceof PiEditSubProjection) {
                    result += `${this.makeSubProjection(item, indexToName)} `
                }
                this.currentIndex += 1;
            });
        }
        return result;
    }

    private makeSubProjection(item: PiEditSubProjection, indexToName: Map<string, number>): string {
        // console.log(`makeSubProjection().mainIndex: ${this.currentIndex}`)
        // TODO check: I expect exactly one property projection in a sub projection
        if (item.optional) {
            // create an extra rule for the optional part, and an extra syntax analysis method
            let ruleName: string = "";
            let ruleText: string = "";
            let propIndex: number = 0; // the index of the property within the new rule
            let propType: string = "";
            item.items.forEach((sub, index) => {
                if (sub instanceof PiEditSubProjection) {
                    ruleText += this.makeSubProjection(sub, indexToName);
                }
                if (sub instanceof PiEditPropertyProjection) {
                    let prop = sub.expression.findRefOfLastAppliedFeature();
                    propType = Names.classifier(prop.type.referred);
                    if (!prop.isPart) { // it's a reference
                        propType = `${Names.PiElementReference}<${propType}>`
                    }
                    ruleName = optionalRulePrefix + prop.name;
                    ruleText += `${this.makePropertyProjection(sub)}`;
                    propIndex = index;
                    indexToName.set(prop.name, this.currentIndex); // the index of the complete optional part within the main rule
                }
                if (sub instanceof PiEditProjectionText) {
                    ruleText += `${this.makeTextProjection(sub)}`;
                }
            });
            this.generatedParseRules.push(`${ruleName} = ${ruleText}`);

            // to be used as part of the if-statement in transformBranch()
            this.branchNames.push(ruleName);

            // syntax analysis
            this.generatedSyntaxAnalyserMethods.push(
                `/**
                * Method to transform branches that match the following rule:
                * ${this.addCommentStars(`${ruleName} = ${ruleText}`)}
                * @param branch
                * @private
                */
                private transform${ruleName}(branch: SPPTBranch): ${propType} {
                    // console.log("transform${ruleName} called");
                    // An optional branch is a List with 0 or 1 element, so you always have the list node in between.
                    return this.transformNode(branch.nonSkipChildren.toArray()[${propIndex-1}]);
                }`);

            return `${ruleName}?`; // the 'call' to the new rule in the main rule
        } else {
            // console.log(`FOUND non-optional sub projection`);
            return `${this.doAllItems(item.items, indexToName)}`;
        }
    }

    private makePropertyProjection(item: PiEditPropertyProjection): string {
        const myElem = item.expression.findRefOfLastAppliedFeature();
        if (!!myElem) {
            let propTypeName = this.makeRuleName(myElem, item);
            if (myElem.isList) {
                let propEntry: string = "";
                let joinText = this.makeListJoinText(item.listJoin?.joinText);
                this.separatorToProp.set(myElem, joinText);

                // joinText can be (1) separator, (2) terminator, or (3) empty
                if (joinText.length == 0) {
                    propEntry = `${propTypeName}*`;
                } else if (item.listJoin?.joinType === ListJoinType.Separator) {
                    propEntry = `[${propTypeName} / '${joinText}' ]*`;
                } else if (item.listJoin?.joinType === ListJoinType.Terminator) {
                    propEntry = `(${propTypeName} '${joinText}' )*`
                }
                return propEntry;
            } else {
                return `${propTypeName}`;
            }
        } else {
            return "";
        }
    }

    private makeTextProjection(item: PiEditProjectionText): string {
        const trimmed = item.text.trim();
        let splitted: string[];
        if (trimmed.includes(" ")) { // we need to add a series of texts with whitespace between them
            this.currentIndex -= 1; // we already counted this text projection, but have to inject multiple entries in the parse rule
            splitted = trimmed.split(" ");
            let result: string = "";
            splitted.forEach(str => {
                if (str.length > 0) {
                    this.currentIndex += 1;
                    result += `\'${this.escapeRelevantChars(str)}\' `;
                }
            });
            return result;
        } else {
            if (trimmed.length > 0) {
                return `\'${this.escapeRelevantChars(trimmed)}\' `;
            } else {
                this.currentIndex -= 1; // we already counted this text projection, but get nothing to put in the parse rule
                return ``;
            }
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

    private makeRuleName(myElem: PiProperty, item: PiEditPropertyProjection): string {
        // TODO make a difference between variables and stringLiterals in the .ast file
        let typeName: string = "";
        if (myElem instanceof PiPrimitiveProperty) {
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
        } else {
            typeName = Names.classifier(myElem.type.referred);
            if (!myElem.isPart) { // it is a reference, so use the rule for creating a PiElementReference
                typeName += referencePostfix;
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

    private addCommentStars(input: string): string {
        input = input.replace(new RegExp("\n","gm") , "\n\t*");
        return input;
    }

    private escapeRelevantChars(input: string): string {
        const regexSpecialCharacters = [
            "\"", "\'"
            // "\\", ".", "+", "*", "?",
            // "[", "^", "]", "$", "(",
            // ")", "{", "}", "=", "!",
            // "<", ">", "|", ":", "-"
        ];

        regexSpecialCharacters.forEach(rgxSpecChar =>
            input = input.replace(new RegExp("\\" + rgxSpecChar,"gm"), "\\\\" +
                rgxSpecChar));
        return input;
    }

    /**
     * returns the list of classifiers with all classifiers that have primitive properties
     * as last
     * @param implementors
     * @private
     */
    private sortImplementors(implementors: PiClassifier[]): PiClassifier[] {
        // TODO should be done recursively!!!
        // TODO if this works then the ref-correction can be done differently
        let result: PiClassifier[] = [];
        let withPrims: PiClassifier[] = [];
        for (const concept of implementors) {
            if (concept.primProperties.length > 0 ) {
                // there are primitive props, move this implementor to the end
                withPrims.push(concept);
            } else {
                result.push(concept);
            }
        }
        result.push(...withPrims);
        return result;
    }
}
