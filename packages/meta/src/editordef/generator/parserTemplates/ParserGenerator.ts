import {
    PiBinaryExpressionConcept,
    PiClassifier,
    PiConcept, PiExpressionConcept, PiInstance,
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
import { LangUtil, Names, getBaseTypeAsString } from "../../../utils";
import { GrammarTemplate } from "./GrammarTemplate";
import { SyntaxAnalyserTemplate } from "./SyntaxAnalyserTemplate";
import { SemanticAnalysisTemplate } from "./SemanticAnalysisTemplate";
import { PiPrimitiveType } from "../../../languagedef/metalanguage/PiLanguage";
import { LanguageAnalyser } from "./LanguageAnalyser";

export class ParserGenerator {
    private language: PiLanguage = null;
    private unit: PiConcept = null;
    private editUnit: PiEditUnit = null;
    // the optionality of properties depends on both the optionality declared in the .ast def, and on the optionality of projections in the .edit def
    // therefore we keep track of these in 'optionalProps'
    private optionalProps: PiProperty[] = [];
    private generatedParseRules: string[] = [];
    private generatedSyntaxAnalyserMethods: string[] = [];
    private branchNames: string[] = [];
    private imports: PiClassifier[] = [];
    private currentIndex = 0;
    private specialBinaryRuleName = `__pi_binary_expression`;
    private separatorToProp: Map<PiProperty, string> = new Map<PiProperty, string>();
    private refCorrectorMaker: SemanticAnalysisTemplate = new SemanticAnalysisTemplate();
    private listWithExtras: PiProperty[] = [];
    private keywordBooleans: PiPrimitiveProperty[] = [];
    private indexOfProp: Map<PiProperty, number> = new Map<PiProperty, number>();
    private optionalIndexOfProp: Map<PiProperty, number> = new Map<PiProperty, number>();

    generateParserForUnit(language: PiLanguage, langUnit: PiConcept, editUnit: PiEditUnit) {
        // reset all attributes that are global to this class
        this.reset();
        this.language = language;
        this.unit = langUnit;
        this.editUnit = editUnit;
        // analyse the language unit and store the results in the global attributes
        let myLanguageAnalyser: LanguageAnalyser = new LanguageAnalyser();
        myLanguageAnalyser.analyseUnit(langUnit);
        this.optionalProps = myLanguageAnalyser.optionalProps;
        // do the concepts
        this.generateConcepts(editUnit, myLanguageAnalyser.conceptsUsed);
        // do the interfaces
        this.generateChoiceRules(myLanguageAnalyser.interfacesAndAbstractsUsed);
        // do the referred types
        this.generateLimitedRules(editUnit, myLanguageAnalyser.limitedsReferred);
        // do the binary expressions
        if (myLanguageAnalyser.binaryConceptsUsed.length > 0) {
            this.generateBinaryExpressions(language, editUnit, myLanguageAnalyser.binaryConceptsUsed);
        }
        // do analysis for semantic phase
        this.refCorrectorMaker.analyse(myLanguageAnalyser.interfacesAndAbstractsUsed);
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
        return this.refCorrectorMaker.makeCorrector(this.language, relativePath);
    }

    getRefCorrectorWalkerContent(relativePath: string): string {
        return this.refCorrectorMaker.makeWalker(this.language, relativePath);
    }

    private reset() {
        this.language = null;
        this.unit = null;
        this.editUnit = null;
        this.generatedParseRules = [];
        this.generatedSyntaxAnalyserMethods = [];
        this.branchNames = [];
        this.imports = [];
        this.currentIndex = 0;
        this.listWithExtras = [];
        this.keywordBooleans = [];
        this.indexOfProp = new Map<PiProperty, number>();
        this.optionalIndexOfProp = new Map<PiProperty, number>();
    }

    private generateBinaryExpressions(language:PiLanguage, editUnit: PiEditUnit, binaryConceptsUsed: PiBinaryExpressionConcept[]) {

        // common information
        const expressionBase: PiExpressionConcept = language.findExpressionBase();
        const editDefs: PiEditConcept[] = this.findEditDefs(binaryConceptsUsed, editUnit);
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

        this.addToImports(binaryConceptsUsed);
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

    private generateLimitedRules(editUnit: PiEditUnit, limitedConcepts: PiClassifier[]) {
        for (const piClassifier of limitedConcepts) {
            // parse rule(s)
            // see if there is a projection defined, so that we can take care
            // of the special projection for a limited concept
            const conceptEditor = editUnit.findConceptEditor(piClassifier);
            if (conceptEditor) {
                // find the mapping of keywords to predef instances
                // fist is the name of the instance, second is the keyword
                let myMap: Map<string, string> = new Map<string, string>();
                conceptEditor.projection.lines.forEach(line => {
                    line.items.forEach(item => {
                        if (item instanceof PiEditInstanceProjection) {
                            myMap.set(item.expression.instanceName, item.keyword);
                        } else {
                            // TODO do we allow other projections for limited concepts????
                        }
                    })
                });
                const myName = Names.classifier(piClassifier);
                this.branchNames.push(myName);
                if (myMap.size > 0) { // found a limited concept with a special projection
                    // make a rule according to the projection
                    this.generatedParseRules.push(this.makeLimitedReferenceRule(myName, myMap));
                    // syntax analysis method(s) are only needed for special projections,
                    // because there is a generic method for references in the template
                    this.generatedSyntaxAnalyserMethods.push(this.makeLimitedSyntaxMethod(myName, myMap));
                } else {
                    // make a 'normal' reference rule
                    let rule = `${myName} = identifier`;
                    this.generatedParseRules.push(rule);
                    let method = `
                    /**
                     * Method to transform branches that match the following rule:
                     * ${ParserGenerator.addCommentStars(rule)}
                     * @param branch
                     * @private
                     */
                     private transform${myName}(branch: SPPTBranch): string {
                        return (branch.matchedText).trim();
                    }`;
                    this.generatedSyntaxAnalyserMethods.push(method);
                }
            }
        }
    }

    private makeLimitedReferenceRule(myName: string, myMap: Map<string, string>) {
        // note that this rule cannot be prefixed with 'leaf'; this would cause the syntax analysis to fail
        let result: string = `${myName} = `;
        let first = true;
        for (const [key, value] of myMap) {
            // prefix the second and all other choices with the '|' symbol
            if (first) {
                first = false;
            } else {
                result += "\n\t| ";
            }
            result += `\'${value}\'`;
        }
        return result;
    }

    // for interfaces and abstract concepts we create a parse rule that is a choice between all classifiers
    // that either implement or extend the concept
    // because limited concepts can only be used as reference, these are excluded for this choice
    private generateChoiceRules(interfacesAndAbstractsUsed: PiClassifier[]) {
        for (const piClassifier of interfacesAndAbstractsUsed) {
            // parse rule(s)
            const branchName = Names.classifier(piClassifier);
            // find the choices for this rule: all concepts that implement or extend the concept
            let implementors: PiClassifier[] = [];
            if (piClassifier instanceof PiInterface) {
                // do not include sub-interfaces, because then we might have 'multiple inheritance' problems
                // instead find the direct implementors and add them
                for (const intf of piClassifier.allSubInterfacesDirect()) {
                    implementors.push(...LangUtil.findImplementorsDirect(intf))
                }
                implementors.push(...LangUtil.findImplementorsDirect(piClassifier));
            } else if (piClassifier instanceof PiConcept) {
                implementors = piClassifier.allSubConceptsDirect();
            }
            // sort the concepts: concepts that have literals in them should go last, because the parser treats them with priority
            implementors = implementors.filter(sub => !(sub instanceof PiLimitedConcept));
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
             * ${ParserGenerator.addCommentStars(rule)}
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
                    if (!this.imports.includes(ext) && !(ext instanceof PiPrimitiveType)) {
                        this.imports.push(ext);
                    }
                }
            } else if (!this.imports.includes(extra) && !(extra instanceof PiPrimitiveType)) {
                this.imports.push(extra);
            }
        }
    }

    private generateConcepts(editUnit: PiEditUnit, conceptsUsed: PiConcept[]) {
        for (const piConcept of conceptsUsed) {
            // find editDef for this concept
            const conceptDef: PiEditConcept = editUnit.findConceptEditor(piConcept);
            const branchName = Names.classifier(piConcept);
            // determine which properties of the concept will get a value through this parse rule
            // note: not all properties need to be present in a projection
            const propsToSet: PiProperty[] = this.findPropsToSet(conceptDef);

            // make the parse rule
            let rule: string = "";

            // TODO test and rethink subconcepts AND concrete projection for one concept
            // see if this concept has subconcepts
            const subs = piConcept.allSubConceptsDirect();
            let choiceBetweenSubconcepts = "";
            if (subs.length > 0) {
                // TODO see if there are binary expressions amongst the implementors
                choiceBetweenSubconcepts = `\n\t| ${subs.map((implementor, index) =>
                    `${Names.classifier(implementor)} `).join("\n\t| ")}`;
            }

            // now we have enough information to create the parse rule
            // which is a choice between the rules for the direct sub-concepts
            // and a rule where every property mentioned in the editor definition is set.
            this.currentIndex = 0;
            rule = `${branchName} = ${conceptDef.projection.lines.map(l =>
                `${this.addCallForItems(branchName, l.items, false)}`
            ).join("\n\t")} ${choiceBetweenSubconcepts}`;
            this.generatedParseRules.push(rule);

            // to be used as part of the if-statement in transformBranch()
            this.branchNames.push(branchName);

            // Syntax analysis
            this.addToImports(piConcept);
            let propStatements: string[] = [];
            for (const prop of propsToSet) {
                propStatements.push(this.makeStatementForProp(prop));
            }
            this.generatedSyntaxAnalyserMethods.push(
            `
            /**
             * Method to transform branches that match the following rule:
             * ${ParserGenerator.addCommentStars(rule)}
             * @param branch
             * @private
             */
            private transform${branchName} (branch: SPPTBranch) : ${branchName} {
                // console.log("transform${branchName} called");
                const children = this.getChildren(branch, 'transform${branchName}');              
                ${propStatements.map(stat => `${stat}`).join("\n")}      
                return ${Names.concept(piConcept)}.create({${propsToSet.map(prop => `${prop.name}:${prop.name}`).join(", ")}});
            }`);
        }
    }

    private makeStatementForProp(prop: PiProperty) : string {
        // different statements needed for (1) optional, (2) list, (3) reference props
        // thus we have 8 possibilities
        // first set a number of overall variables
        const propType = prop.type.referred; // more efficient to determine 'referred' only once
        this.addToImports(propType);
        let propBaseTypeName = getBaseTypeAsString(prop);

        const propName: string = prop.name;
        const propIndex: number = this.indexOfProp.get(prop); // index of this property within the main branch
        const optionalPropIndex: number = this.optionalIndexOfProp.get(prop); // index of this property within an optional sub-branch
        // the second part of the following statement is needed because sometimes optional props are not parsed in a separate group
        // TODO example
        const isOptional: boolean = !!this.optionalProps.find(opt => opt === prop) ;
        let separatorText = this.separatorToProp.get(prop);
        if (!!separatorText && separatorText.length > 0) {
            separatorText = `, "${separatorText}"`;
        }

        // second, create the statement for this property
        if (prop instanceof PiPrimitiveProperty && this.keywordBooleans.includes(prop)) {
            return `// option 12
                            let ${propName}: ${propBaseTypeName} = false;
                            if (!children[${propIndex}].isEmptyMatch) {
                                ${propName} = true;
                            }`;
        }
        if (isOptional) {
            if (optionalPropIndex === undefined) {
                if (!prop.isList && prop.isPart) {
                    // this is the case when a simple "XXX?" call is in the grammar
                    // we need to take the extra 'multi' group in the parse tree into account
                    // TODO change getChildren into getGroup ?
                    return `// option 1
                    const ${propName}: ${propBaseTypeName} = this.transformNode(this.getChildren(children[${propIndex}], "SOME TEXT TO BE DONE"));`;
                } else if (prop.isList && prop.isPart) {     // (list, part, non-optional)
                    return `// option 10 equal to option 8 => 'this.transformList' takes care of the optionality  \nconst ${propName}: ${propBaseTypeName}[] = ` +
                        `this.transformList<${propBaseTypeName}>(children[${propIndex}]${separatorText});`;
                } else if (prop.isList && !prop.isPart) {    // (list, reference, non-optional)
                    return `// option 11 equal to option 9 => 'this.transformRefList' takes care of the optionality\nconst ${propName}: ${Names.PiElementReference}<${propBaseTypeName}>[] = ` +
                        `this.transformRefList<${propBaseTypeName}>(children[${propIndex}], "${Names.classifier(propType)}"${separatorText});`;
                } else {
                    console.log(`Error in parser generator: optionalPropIndex not found for ${propName} in ${this.unit.name}`);
                }
            }
            let specificPart: string = '';
            let propTypeName: string = '';
            let optionComment: string = '';
            if (!prop.isList && prop.isPart) {              // (non-list, part, optional)
                propTypeName = propBaseTypeName;
                optionComment = `// option 2 \n`;
                specificPart = `${propName} = this.transformNode(subNode);`;
            } else if (!prop.isList && !prop.isPart) {      // (non-list, reference, optional)
                propTypeName = `${Names.PiElementReference}<${propBaseTypeName}>`;
                optionComment = `// option 3 \n`;
                specificPart = `${propName} = this.piElemRef<${Names.classifier(propType)}>(subNode, "${Names.classifier(propType)}");`;
            } else if (prop.isList && prop.isPart) {        // (list, part, optional)
                propTypeName = `${propBaseTypeName}[]`;
                optionComment = `// option 4 \n`;
                specificPart = `${propName} = this.transformList<${propBaseTypeName}>(subNode${separatorText});`;
            } else if (prop.isList && !prop.isPart) {       // (list, reference, optional)
                propTypeName = `${Names.PiElementReference}<${propBaseTypeName}>[]`;
                optionComment = `// option 5 \n`;
                specificPart = `${propName} = this.transformRefList<${propBaseTypeName}>(subNode, "${Names.classifier(propType)}"${separatorText});`;
            }
            // this part is common for all optional properties, except for
            // ... the type info in the 1st line, which depends on list/non-list, and on ref/non-ref, therefore this is set in the if-statement above,
            // ... and the statement to get the right value for the property, which is set in 'specificPart'
            return `${optionComment}let ${propName}: ${propTypeName} = null;
                    if (!children[${propIndex}].isEmptyMatch) {
                        // take the ${optionalPropIndex}(-st/nd/rd/th) element of the group that represents the optional part  
                        let subNode = this.getGroup(children[${propIndex}], "SOME TEXT TO BE DONE").nonSkipChildren.toArray()[${optionalPropIndex}];
                        ${specificPart}
                    }`;
        } else {
            if (!prop.isList && prop.isPart) {           // (non-list, part, non-optional)
                return `// option 6 \nconst ${propName}: ${propBaseTypeName} = this.transformNode(children[${propIndex}]);`;
            } else if (!prop.isList && !prop.isPart) {   // (non-list, reference, non-optional)
                return `// option 7 \nconst ${propName}: ${Names.PiElementReference}<${propBaseTypeName}> = ` +
                    `this.piElemRef<${Names.classifier(propType)}>(children[${propIndex}], "${Names.classifier(propType)}");`;
            } else if (prop.isList && prop.isPart) {     // (list, part, non-optional)
                return `// option 8 \nconst ${propName}: ${propBaseTypeName}[] = ` +
                    `this.transformList<${propBaseTypeName}>(children[${propIndex}]${separatorText});`;
            } else if (prop.isList && !prop.isPart) {    // (list, reference, non-optional)
                return `// option 9 \nconst ${propName}: ${Names.PiElementReference}<${propBaseTypeName}>[] = ` +
                    `this.transformRefList<${propBaseTypeName}>(children[${propIndex}], "${Names.classifier(propType)}"${separatorText});`;
            }
        }
        return '';
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

    private addCallForItems(branchName: string, list: PiEditProjectionItem[], optional: boolean): string {
        let propIndex: number;
        let indexToUse: Map<PiProperty, number>;
        if (!optional) {
            propIndex = this.currentIndex; // the index of the property within the main rule
            indexToUse = this.indexOfProp;
        } else {
            propIndex = 0; // the index of the property within the new group
            indexToUse = this.optionalIndexOfProp;
        }
        let prop: PiProperty = null;
        let ruleText: string = '';
        if (!!list && list.length > 0) {
            list.forEach((item) => {
                if (item instanceof PiEditSubProjection) {
                    // TODO check: I expect exactly one property projection in a sub projection
                    ruleText += `${this.addCallForItems(branchName, item.items, item.optional)} `;
                    let subProp: PiProperty = item.optionalProperty().expression.findRefOfLastAppliedFeature();
                    indexToUse.set(subProp, propIndex);
                    propIndex += 1;
                } else if (item instanceof PiEditPropertyProjection) {
                    prop = item.expression.findRefOfLastAppliedFeature();
                    ruleText += `${this.makePropertyProjection(item, optional)} `;
                    indexToUse.set(prop, propIndex);
                    propIndex += 1;
                } else if (item instanceof PiEditProjectionText) {
                    let extraResult: string[] = this.makeTextProjection(item);  // a text projection can ruleText in more than 1 item
                    ruleText += `${extraResult.map(extr => `${extr}`).join(" ")}`;
                    propIndex += extraResult.length;
                    // } else {  // sub is one of PiEditParsedProjectionIndent | PiEditInstanceProjection;
                    // do not increase currentIndex!!!
                }
                this.currentIndex = propIndex;
            });
        }
        if (optional) {
            this.optionalProps.push(prop); // TODO check: is it important to see if prop is already in optionalProps?
            if (propIndex > 0) { // there are multiple elements in the ruleText, so surround them with brackets
                this.listWithExtras.push(prop);
                ruleText = `( ${ruleText} )? /* option F */\n`;
            } else if (!prop.isList) { // there is one element in the ruleText but it is not a list, so we need a '?'
                ruleText = `${ruleText}?  /* option G */`;
            }
        }
        return ruleText;
    }

    // withInOptionalGroup: if this property projection is within an optional group,
    // the rule should not add an extra '?'
    private makePropertyProjection(item: PiEditPropertyProjection, withinOptionalGroup: boolean ): string {
        const myElem = item.expression.findRefOfLastAppliedFeature();
        if (!!myElem) {
            let propTypeName = this.makeRuleCall(myElem, item);
            if (myElem.isList) {
                let propEntry: string = "";
                let joinText = this.makeListJoinText(item.listJoin?.joinText);
                this.separatorToProp.set(myElem, joinText);

                // joinText can be (1) empty, (2) separator, or (3) terminator
                if (joinText.length == 0) {
                    propEntry = `${propTypeName}* /* option A */`;
                } else if (item.listJoin?.joinType === ListJoinType.Separator) {
                    propEntry = `[${propTypeName} / '${joinText}' ]* /* option B */`;
                } else if (item.listJoin?.joinType === ListJoinType.Terminator) {
                    propEntry = `(${propTypeName} '${joinText}' )* /* option C */`
                }
                return propEntry;
            } else {
                // only add '?' when myElem is not a list or not in an optional group
                if (myElem.isOptional && !withinOptionalGroup) {
                    this.optionalIndexOfProp.set(myElem, 0);
                    return `${propTypeName}? /* option D */`
                }
                return `${propTypeName} /* option E */`;
            }
        } else {
            return "";
        }
    }

    private makeTextProjection(item: PiEditProjectionText): string[] {
        let result: string[] = [];
        const trimmed = item.text.trim();
        let splitted: string[];
        if (trimmed.includes(" ")) { // we need to add a series of texts with whitespace between them
            splitted = trimmed.split(" ");
            splitted.forEach(str => {
                if (str.length > 0) {
                    result.push(`\'${this.escapeRelevantChars(str)}\' `);
                }
            });
            return result;
        } else {
            if (trimmed.length > 0) {
                result.push(`\'${this.escapeRelevantChars(trimmed)}\' `);
            }
        }
        return result;
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

    // returns a string that is the name of the parse rule for myElem
    // to be used in the both the 'call' and the 'definition' of the rule
    private makeRuleCall(myElem: PiProperty, item: PiEditPropertyProjection): string {
        let ruleName: string = "";
        if (myElem instanceof PiPrimitiveProperty) {
            switch (myElem.type.referred) {
                case PiPrimitiveType.string: {
                    ruleName = "stringLiteral";
                    break;
                }
                case PiPrimitiveType.identifier: {
                    ruleName = "identifier";
                    break;
                }
                case PiPrimitiveType.number: {
                    ruleName = "numberLiteral";
                    break;
                }
                case PiPrimitiveType.boolean: {
                    if (!!item.keyword) {
                        this.keywordBooleans.push(myElem);
                        ruleName = `"${item.keyword}"`
                    } else {
                        ruleName = "booleanLiteral";
                    }
                    break;
                }
                default:
                    ruleName = "stringLiteral";
            }
        } else {
            const myType = myElem.type.referred;
            if (!myElem.isPart) { // it is a reference, either use an identifier or the rule for limited concept
                if (myType instanceof PiLimitedConcept) {
                    const conceptEditor = this.editUnit.findConceptEditor(myType);
                    if (!!conceptEditor) {
                        ruleName = Names.classifier(myType);
                    }
                }else {
                    ruleName = "identifier";
                }
            } else {
                ruleName = Names.classifier(myType);
            }
        }
        return ruleName;
    }

    private findEditDefs(binaryConceptsUsed: PiBinaryExpressionConcept[], editUnit: PiEditUnit): PiEditConcept[] {
        let result: PiEditConcept[] = [];
        for (const binCon of binaryConceptsUsed) {
            result.push(editUnit.findConceptEditor(binCon));
        }
        return result;
    }

    private static addCommentStars(input: string): string {
        input = input.replace(new RegExp("\n","gm") , "\n\t*");
        input = input.replace(new RegExp("/\\*","gm") , "--");
        input = input.replace(new RegExp("\\*/","gm") , "--");
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
        // TODO find out whether we can rwemove this method completely
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

    private makeLimitedSyntaxMethod(myName: string, myMap: Map<string, string>) {
        let ifStat: string = '';
        for (const [key, value] of myMap) {
            ifStat += `if (choice == '${value}') {
                return '${key}';
            } else `
        }
        // close the ifStatement
        ifStat += `{
                return null;
            }`;
        return `
        private transform${myName}(branch: SPPTBranch): string {
            let choice = (branch.matchedText).trim();
            ${ifStat}
        }`;
    }
}
