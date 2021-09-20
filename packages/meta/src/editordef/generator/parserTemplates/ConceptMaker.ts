import {
    ListJoinType,
    PiEditConcept,
    PiEditProjectionItem,
    PiEditProjectionText,
    PiEditPropertyProjection,
    PiEditSubProjection,
    PiEditUnit
} from "../../metalanguage";
import { PiClassifier, PiConcept, PiLimitedConcept, PiPrimitiveProperty, PiProperty } from "../../../languagedef/metalanguage";
import { getBaseTypeAsString, Names } from "../../../utils";
import { ParserGenUtil } from "./ParserGenUtil";
import { PiPrimitiveType } from "../../../languagedef/metalanguage/PiLanguage";

export class ConceptMaker {
    generatedParseRules: string[] = [];
    generatedSyntaxAnalyserMethods: string[] = [];
    branchNames: string[] = [];
    imports: PiClassifier[] = [];

    private currentIndex = 0;
    private separatorToProp: Map<PiProperty, string> = new Map<PiProperty, string>();
    private indexOfProp: Map<PiProperty, number> = new Map<PiProperty, number>();
    private optionalIndexOfProp: Map<PiProperty, number> = new Map<PiProperty, number>();
    private listWithExtras: PiProperty[] = [];
    private keywordBooleans: PiPrimitiveProperty[] = [];
    // the optionality of properties depends on both the optionality declared in the .ast def, and on the optionality of projections in the .edit def
    // therefore we keep track of these in 'optionalProps'
    private optionalProps: PiProperty[] = [];

    generateConcepts(editUnit: PiEditUnit, conceptsUsed: PiConcept[], optionalProps: PiProperty[]) {
        this.optionalProps = optionalProps;
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
            this.imports.push(piConcept);
            let propStatements: string[] = [];
            for (const prop of propsToSet) {
                propStatements.push(this.makeStatementForProp(prop));
            }
            this.generatedSyntaxAnalyserMethods.push(
                `${ParserGenUtil.makeComment(rule)}
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
        this.imports.push(propType);
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
                    console.log(`Error in parser generator: optionalPropIndex not found for ${propName} of ${prop.owningConcept.name}`);
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
                    result.push(`\'${ParserGenUtil.escapeRelevantChars(str)}\' `);
                }
            });
            return result;
        } else {
            if (trimmed.length > 0) {
                result.push(`\'${ParserGenUtil.escapeRelevantChars(trimmed)}\' `);
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
                    ruleName = Names.classifier(myType);
                } else {
                    ruleName = "identifier";
                }
            } else {
                ruleName = Names.classifier(myType);
            }
        }
        return ruleName;
    }
}
