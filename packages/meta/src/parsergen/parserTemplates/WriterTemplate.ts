import { hasNameProperty, LANGUAGE_GEN_FOLDER, Names, PROJECTITCORE } from "../../utils";
import {
    PiBinaryExpressionConcept, PiClassifier,
    PiConcept,
    PiLanguage, PiLimitedConcept,
    PiPrimitiveProperty,
    PiProperty
} from "../../languagedef/metalanguage";
import { sortClasses, langExpToTypeScript } from "../../utils";
import {
    PiEditConcept,
    PiEditUnit,
    PiEditProjectionText,
    PiEditPropertyProjection,
    PiEditProjectionDirection,
    ListJoinType,
    PiEditProjectionLine, PiEditInstanceProjection, PiEditSubProjection, PiEditProjectionItem
} from "../../editordef/metalanguage";
import { PiPrimitiveType } from "../../languagedef/metalanguage";
import { ParserGenUtil } from "./ParserGenUtil";

export class WriterTemplate {

    /**
     * Returns a string representation of the class that implements an unparser for modelunits of
     * 'language', based on the given editor definition.
     */
    public generateUnparser(language: PiLanguage, editDef: PiEditUnit, relativePath: string): string {
        const allLangConcepts: string = Names.allConcepts(language);
        const generatedClassName: String = Names.writer(language);
        const writerInterfaceName: string = Names.PiWriter;
        let limitedConcepts: PiLimitedConcept[] = [];
        const elementsToUnparse: PiClassifier[] = sortClasses(language.concepts);
        elementsToUnparse.push(...language.units);

        // find all limited concepts used, the are treated differently in both (1) the creation of unparse method
        // (2) in the generic method 'unparseReferenceList'
        for (const conceptDef of editDef.conceptEditors) {
            const myConcept: PiClassifier = conceptDef.concept.referred;
            if (myConcept instanceof PiLimitedConcept) {
                limitedConcepts.push(myConcept);
            }
        }

        // Template starts here
        return `
        import { ${Names.PiNamedElement}, ${writerInterfaceName} } from "${PROJECTITCORE}";
        import { ${allLangConcepts}, ${Names.PiElementReference}, ${language.units.map(concept => `
                ${Names.classifier(concept)}`).join(", ")},
            ${language.concepts.map(concept => `
                    ${Names.concept(concept)}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";     
        
        /**
         * SeparatorType is used to unparse lists.
         * NONE means only space(s) between the elements.
         * Terminator means that every element is terminated with a certain string.
         * Separator means that in between elements a certain string is placed.
         */
        enum SeparatorType {
            NONE = "NONE",
            Terminator = "Terminator",
            Separator = "Separator"
        }

        /**
         * Class ${generatedClassName} provides methods to return a string representation of an instance of
         * elements of language ${language.name}.
         * It is, amongst others, used to create error messages in the validator.
         */
        export class ${generatedClassName} implements ${writerInterfaceName} {
            output: string[] = [];     // stores the result, one line per array element
            currentLine: number = 0;   // keeps track of the element in 'output' that we are working on

            /**
             * Returns a string representation of 'modelelement'.
             * If 'short' is present and true, then a single-line result will be given.
             * Otherwise, the result is always a multi-line string.
             * Note that the single-line-string cannot be parsed into a correct model.
             * 
             * @param modelelement
             * @param startIndent
             * @param short
             */
            public writeToString(modelelement: ${allLangConcepts}, startIndent?: number, short?: boolean) : string {
                this.writeToLines(modelelement, startIndent, short);
                return \`\$\{this.output.map(line => \`\$\{line\}\`).join("\\n").trimRight()}\`;
            }
 
            /**
             * Returns a string representation of 'modelelement', divided into an array of strings,
             * each of which contain a single line (without newline).
             * If 'short' is present and true, then a single-line result will be given.
             * Otherwise, the result is always a multi-line string.
             *
             * @param modelelement
             * @param startIndent
             * @param short
             */
            public writeToLines(modelelement: ${allLangConcepts}, startIndent?: number, short?: boolean): string[] {
                // set default for optional parameters
                if (startIndent === undefined) {
                    startIndent = 0;
                }
                if (short === undefined) {
                    short = false;
                }
        
                // make sure the global variables are reset
                this.output = [];
                this.currentLine = 0;
        
                // begin the unparsing with an indent if asked for
                let indentString: string = "";
                for (let _i = 0; _i < startIndent; _i++) {
                    indentString += " ";
                }
                this.output[this.currentLine] = indentString;
        
                // do the actual work
                this.unparse(modelelement, short);
                return this.output;
            }
            
            /**
             * Returns the name of 'modelelement' if it has one, else returns
             * a short unparsing of 'modelelement'.
             * Used by the validator to produce readable error messages.
             *
             * @param modelelement
             */
            public writeNameOnly(modelelement: ${allLangConcepts}): string {
                ${this.makeWriteOnly(language)}
            }
        
            private unparse(modelelement: ${allLangConcepts}, short: boolean) {
                ${elementsToUnparse.map((concept, index) => `
                ${index == 0 ? `` : `} else ` }if (modelelement instanceof ${Names.classifier(concept)}) {
                    this.unparse${Names.classifier(concept)}(modelelement, short);`).join("")}
                }
            }

            ${editDef.conceptEditors.map(conceptDef => `${this.makeConceptMethod(conceptDef)}`).join("\n")}
             
            /**
             *
            */
            private unparseReference(modelelement: PiElementReference<PiNamedElement>, short: boolean) {
                const type: PiNamedElement = modelelement.referred;
                if (!!type) {
                    ${limitedConcepts.length > 0 
                    ? 
                        `${limitedConcepts.map((lim, index) =>
                        `${index == 0 ? `` : `} else `}if (type instanceof ${Names.concept(lim)}) {
                            this.unparse${Names.concept(lim)}(type, short);`).join("")}
                        } else {
                            this.output[this.currentLine] +=  type.name + " ";
                        }`
                    :
                        `this.output[this.currentLine] +=  type.name + " ";`
                    }
                } else {
                    this.output[this.currentLine] += modelelement.name + " ";
                }
            }
       
            /**
             * Adds a string representation of 'list' to the 'output', using 'sepText' , and 'sepType' to include either a separator string
             * or a terminator string. Param 'vertical' indicates whether the list should be represented vertically or horizontally.
             * If 'short' is false, then a multi-line result will be given. Otherwise, only one single-line string is added.
             * @param list
             * @param sepText
             * @param sepType
             * @param vertical
             * @param indent
             * @param short
             */         
            private unparseList(list: ${allLangConcepts}[], sepText: string, sepType: SeparatorType, vertical: boolean, indent: number, short: boolean) {
                list.forEach((listElem, index) => {
                    const isLastInList: boolean = index === list.length - 1;
                    this.unparse(listElem, short);
                    this.doSeparatorOrTerminatorAndNewline(sepType, isLastInList, sepText, vertical, short, indent);
                });
            }

            /**
             * Adds a string representation of a list of references, where every reference
             * is replaced by the name of its referred element. The use of params
             * 'sepText' and 'SepType' are equals to those in the private method unparseList.
             * @param list
             * @param sepText
             * @param sepType
             * @param vertical
             * @param indent
             * @param short
             */
            private unparseReferenceList(list: ${Names.PiElementReference}<${Names.PiNamedElement}>[], sepText: string, sepType: SeparatorType, vertical: boolean, indent: number, short: boolean) {
                list.forEach((listElem, index) => {
                    const isLastInList: boolean = index === list.length - 1;                   
                    this.unparseReference(listElem, short);                 
                    this.doSeparatorOrTerminatorAndNewline(sepType, isLastInList, sepText, vertical, short, indent);
                });
            }
            
            /**
             * Adds a string representation of 'list' to the 'output', using 'sepText' , and 'sepType' to include either a separator string
             * or a terminator string. Param 'vertical' indicates whether the list should be represented vertically or horizontally.
             * If 'short' is false, then a multi-line result will be given. Otherwise, only one single-line string is added.
             * @param list
             * @param isIdentifier : indicates whether or not the value should be surrounded with double quotes
             * @param sepText
             * @param sepType
             * @param vertical
             * @param indent
             * @param short
             */   
            private unparseListOfPrimitiveValues(
                list: (string | number | boolean)[],
                isIdentifier: boolean,
                sepText: string,
                sepType: SeparatorType,
                vertical: boolean,
                indent: number,
                short: boolean
            ) {
                if (!!list) {
                    list.forEach((listElem, index) => {
                        const isLastInList: boolean = index === list.length - 1;
                        if (typeof listElem === "string" && !isIdentifier) {
                            this.output[this.currentLine] += \`\"\$\{listElem\}\"\`;
                        } else {
                            this.output[this.currentLine] += \`\$\{listElem\}\`;
                        }
                        this.doSeparatorOrTerminatorAndNewline(sepType, isLastInList, sepText, vertical, short, indent);
                    });
                }
            }
            
            /**
             * Adds a separator text or a terminator text (followed by a newline and the right amount of indentation) 
             * to the output, depending on the parameters.
             * @param sepType
             * @param isLastInList
             * @param sepText
             * @param vertical
             * @param short
             * @param indent
             */
            // tslint:disable-next-line:max-line-length
            private doSeparatorOrTerminatorAndNewline(sepType: SeparatorType, isLastInList: boolean, sepText: string, vertical: boolean, short: boolean, indent: number) {
                // first eliminate any whitespace at the end of the line
                this.output[this.currentLine] = this.output[this.currentLine].trimRight();
                
                // then add the right separator or terminator
                switch (sepType) {
                    case SeparatorType.Separator: {
                        if (!isLastInList) {
                            this.output[this.currentLine] += sepText;
                        }
                        break;
                    }
                    case SeparatorType.Terminator: {
                        this.output[this.currentLine] += sepText;
                        break;
                    }
                    case SeparatorType.NONE: {
                        break;
                    }
                }
                
                // then add newline and indentation
                if (vertical && !isLastInList) {
                    if (!short) {
                        this.newlineAndIndentation(indent);
                    } else { // stop after 1 line
                        // note that the following cannot be parsed
                        this.output[this.currentLine] += \` ...\`;
                    }
                } else if (!vertical && isLastInList) {
                    this.output[this.currentLine] += \` \`;
                }
            }
        
            /**
             * Makes a a new entry in the 'output' array
             * and adds the indentation of 'number' spaces
             * to the new entry/line.
             * @param indent
             */
            private newlineAndIndentation(indent: number) {
                this.currentLine += 1;
                let indentation: string = "";
                for (let _i = 0; _i < indent; _i++) {
                    indentation += " ";
                }
                this.output[this.currentLine] = indentation;
            }
        } `;
    }

    /**
     * Creates a method that unparses the concept in 'conceptDef' based on the projection in
     * 'conceptDef'. If the concept is a limited concept it is treated differently, because
     * limited concepts can only be used as a reference.
     * @param conceptDef
     */
    private makeConceptMethod (conceptDef: PiEditConcept): string {
        const myConcept: PiClassifier = conceptDef.concept.referred;
        if (myConcept instanceof PiLimitedConcept){
            return this.makeLimitedMethod(conceptDef, myConcept);
        } else if (myConcept instanceof PiConcept && myConcept.isAbstract) {
            return this.makeAbstractMethod(myConcept);
        } else {
            return this.makeNormalMethod(conceptDef, myConcept);
        }
    }

    private makeLimitedMethod(conceptDef: PiEditConcept, myConcept: PiLimitedConcept) {
        // when a '@keyword' projection is present, use that
        // when not, use the name of the instance of the limited concept
        let result = this.makeLimitedKeywordMethod(conceptDef, myConcept);
        if (result.length > 0) { // it was a `@keyword` projection
            return result;
        } else {
            const name: string = Names.concept(myConcept);
            return `/**
                         * The limited concept '${myConcept.name}' is unparsed as its name.
                         */
                        private unparse${name}(modelelement: ${name}, short: boolean) {
                            if (!!modelelement) {
                                this.output[this.currentLine] += modelelement.name + " ";
                            }
                        }`;
        }
    }

    private makeLimitedKeywordMethod(conceptDef: PiEditConcept, myConcept: PiLimitedConcept) {
        const comment = `/**
                          * The limited concept '${myConcept.name}' is unparsed according to the keywords in the editor definition.
                          */`;
        const name: string = Names.concept(myConcept);
        const lines: PiEditProjectionLine[] = conceptDef.projection?.lines;

        // if the special '@keyword' construct is used, we create an extra method with a switch statement
        // if not, do nothing, the limited concept is being referred to by its name
        if (!!lines) {
            let cases: string = "";
            lines.map(line => line.items.map(item => {
                // if the special '@keyword' construct is used, there will be instances of PiEditInstanceProjection
                if (item instanceof PiEditInstanceProjection) {
                    // add escapes to keyword
                    const myKeyword = ParserGenUtil.escapeRelevantChars(item.keyword);
                    cases += `case ${item.expression.sourceName}.${item.expression.instanceName}: {
                                this.output[this.currentLine] += "${myKeyword} ";
                                break;
                                }
                                `
                }
            }));
            if (cases.length > 0) {
                return `
                    ${comment}
                        private unparse${name}(modelelement: ${name}, short: boolean) {
                            if (!!modelelement) {
                                switch (modelelement) {
                                    ${cases}
                                    default: {
                                        this.output[this.currentLine] += modelelement.name + " ";
                                    }
                                }
                            }
                        }`;
            }
        }
        return "";
    }

    private makeAbstractMethod(myConcept: PiConcept): string {
        const name: string = Names.concept(myConcept);
        return `/**
                 * The abstract concept '${myConcept.name}' is not unparsed.
                 */
                private unparse${name}(modelelement: ${name}, short: boolean) {
                    throw new Error('Method unparse${name} should be implemented by its (concrete) subclasses.');
                }`;
    }

    private makeNormalMethod(conceptDef: PiEditConcept, myConcept: PiClassifier) {
        const name: string = Names.classifier(myConcept);
        const lines: PiEditProjectionLine[] = conceptDef.projection?.lines;
        const comment = `/**
                          * See the public unparse method.
                          */`;

        if (!!lines) {
            if (lines.length > 1) {
                return `
                ${comment}
                private unparse${name}(modelelement: ${name}, short: boolean) {
                    const blockIndent = this.output[this.currentLine].length;
                    // do the first line
                    ${this.makeLine(lines[0])}
                    if (!short) { // do the rest of the lines as well
                        ${this.makeRemainingLines(lines)}
                    }
                }`;
            } else {
                return `
                ${comment}
                private unparse${name}(modelelement: ${name}, short: boolean) {
                    ${this.makeLine(lines[0])}
                }`;
            }
        } else {
            // TODO check in which cases there are no lines in the edit def
            if (myConcept instanceof PiBinaryExpressionConcept && !!(conceptDef.symbol)) {
                return `${comment}
                    private unparse${name}(modelelement: ${name}, short: boolean) {
                        //this.output[this.currentLine] += "( ";
                        this.unparse(modelelement.left, short);
                        this.output[this.currentLine] += "${conceptDef.symbol} ";
                        this.unparse(modelelement.right, short);
                        //this.output[this.currentLine] += ") ";
                }`;
            }
            if (myConcept instanceof PiConcept && myConcept.isAbstract) {
                return `${comment}
                    private unparse${name}(modelelement: ${name}, short: boolean) {
                        this.output[this.currentLine] += \`'unparse' should be implemented by subclasses of ${myConcept.name}\`;
                }`;
            }
            return "";
        }
    }

    /**
     * Creates the statements needed to unparse a single line in an editor projection definition
     * @param line
     */
    // TODO indents are not completely correct because tabs are not yet recognised by the .edit parser
    private makeLine (line: PiEditProjectionLine): string {
        let result: string = ``;
        line.items.forEach(item => {
            result += this.makeItem(item, line.indent);
        });
        return result;
    }

    private makeItem(item: PiEditProjectionItem, indent: number): string {
        let result: string = ``;
        if (item instanceof PiEditProjectionText) {
            // add escapes to item.text
            const myText = ParserGenUtil.escapeRelevantChars(item.text).trimRight();
            result += `this.output[this.currentLine] += \`${myText} \`;\n`;
        } else if (item instanceof PiEditPropertyProjection) {
            const myElem = item.expression.findRefOfLastAppliedFeature();
            if (myElem instanceof PiPrimitiveProperty) {
                result += this.makeItemWithPrimitiveType(myElem, item);
            } else {
                result += this.makeItemWithConceptType(myElem, item, indent);
            }
        } else if (item instanceof PiEditSubProjection){
            let myTypeScript: string = "";
            let subresult: string = "";
            item.items.forEach(sub => {
                subresult += this.makeItem(sub, indent);
                if (sub instanceof PiEditPropertyProjection) {
                    myTypeScript = langExpToTypeScript(sub.expression);
                    if (sub.expression.findRefOfLastAppliedFeature().isList) {
                        myTypeScript = `!!${myTypeScript} && ${myTypeScript}.length > 0`;
                    } else {
                        // TODO remove this hack as soon as TODO in ModelHelpers.langExpToTypeScript is resolved.
                        // remove only the last ".referred"
                        myTypeScript = this.removeLastReferred(myTypeScript);
                        // end hack
                        myTypeScript = `!!${myTypeScript}`;
                    }
                }
            });
            if (item.optional && myTypeScript.length > 0) { // surround whole sub-projection with an if-statement
                result += `if (${myTypeScript}) { ${subresult} }`;
            } else {
                result += subresult;
            }
        }
        return result;
    }
    /**
     * Creates the statements needed to unparse lines[1] till lines[lines.length -1], as well as
     * the statements needed to generate newlines and indentation.
     * @param lines
     */
    private makeRemainingLines(lines: PiEditProjectionLine[]): string {
        let first = true;
        let result: string = "";
        lines.forEach(line => {
            if (first) { // skip the first line, this is already taken care of in 'makeConceptMethod'
                first = false;
            } else {
                result += `this.newlineAndIndentation(blockIndent + ${line.indent});
                           ${this.makeLine(line)}`;
            }
        });
        return result;
    }

    /**
     * Creates the statement needed to unparse an element with primitive type. The element may be a list or
     * a single property.
     * @param myElem
     * @param item
     */
    private makeItemWithPrimitiveType(myElem: PiPrimitiveProperty, item: PiEditPropertyProjection): string {
        // the expression is of primitive type
        let result: string = ``;
        const elemStr = langExpToTypeScript(item.expression);
        if (myElem.isList) {
            let isIdentifier: string = "false";
            if (myElem.type.referred === PiPrimitiveType.identifier) {
                isIdentifier = "true";
            }
            const vertical = (item.listJoin.direction === PiEditProjectionDirection.Vertical);
            const joinType = this.getJoinType(item);
            // add escapes to joinText
            const myJoinText = ParserGenUtil.escapeRelevantChars(item.listJoin.joinText);
            result += `this.unparseListOfPrimitiveValues(
                    ${elemStr}, ${isIdentifier},"${myJoinText}", ${joinType}, ${vertical},
                    this.output[this.currentLine].length,
                    short
                );`;
        } else {
            let myCall: string = ``;
            const myType: PiClassifier = myElem.type.referred;
            if (myType === PiPrimitiveType.string ) {
                myCall = `this.output[this.currentLine] += \`\"\$\{${elemStr}\}\" \``;
            } else if (myType === PiPrimitiveType.boolean && !!item.keyword) {
                // add escapes to keyword
                const myKeyword = ParserGenUtil.escapeRelevantChars(item.keyword);
                myCall = `if (${elemStr}) { 
                              this.output[this.currentLine] += \`${myKeyword} \`
                          }`;
            } else {
                myCall = `this.output[this.currentLine] += \`\$\{${elemStr}\} \``;
            }
            result += myCall;
        }
        return result + ";\n";
    }

    /**
     * Creates the statement needed to unparse an element whose type is a concept. Takes into account that the type might be a list
     * of concepts, and that the type might be a reference to a concept.
     * @param myElem
     * @param item
     * @param indent
     */
    private makeItemWithConceptType(myElem: PiProperty, item: PiEditPropertyProjection, indent: number) {
        // the expression has a concept as type, thus we need to call its unparse method
        let result: string = "";
        const type = myElem.type.referred;
        if (!!type) {
            let myTypeScript: string = langExpToTypeScript(item.expression);
            if (myElem.isList) {
                const vertical = (item.listJoin.direction === PiEditProjectionDirection.Vertical);
                const joinType = this.getJoinType(item);

                if (myElem.isPart) {
                    result += `this.unparseList(${myTypeScript}, "${item.listJoin.joinText}", ${joinType}, ${vertical}, this.output[this.currentLine].length, short) `;
                } else {
                    result += `this.unparseReferenceList(${myTypeScript}, "${item.listJoin.joinText}", ${joinType}, ${vertical}, this.output[this.currentLine].length, short) `;
                }
            } else {
                let myCall: string = "";
                if (myElem.isPart) {
                    myCall += `this.unparse(${myTypeScript}, short) `;
                } else {
                    // TODO remove this hack as soon as TODO in ModelHelpers.langExpToTypeScript is resolved.
                    // remove only the last ".referred"
                    myTypeScript = this.removeLastReferred(myTypeScript);
                    // end hack
                    myCall += `this.unparseReference(${myTypeScript}, short);`;
                    // if (type instanceof PiLimitedConcept) {
                    //     myCall += `this.unparse${type.name}(${myTypeScript}, short);`;
                    // } else {
                    //     myCall += `this.output[this.currentLine] += \`\$\{${myTypeScript}.name\} \``;
                    // }
                }
                if (myElem.isOptional) { // surround the unparse call with an if-statement, because the element may not be present
                    result += `if (!!${myTypeScript}) { ${myCall} }`;
                } else {
                    result = myCall;
                }
            }
        }
        return result + ";\n";
    }

    private removeLastReferred(myTypeScript: string) {
        if (myTypeScript.endsWith("?.referred")) {
            myTypeScript = myTypeScript.substring(0, myTypeScript.length - 10);
        } else if (myTypeScript.endsWith(".referred")) {
            myTypeScript = myTypeScript.substring(0, myTypeScript.length - 9);
        }
        return myTypeScript;
    }

    /**
     * Changes the jointype in 'item' into the text needed in the unparser.
     * @param item
     */
    private getJoinType(item: PiEditPropertyProjection): string {
        let joinType: string = "";
        if (item.listJoin.joinType === ListJoinType.Separator) {
            joinType = "SeparatorType.Separator";
        } else if (item.listJoin.joinType === ListJoinType.Terminator) {
            joinType = "SeparatorType.Terminator";
        } else if (item.listJoin.joinType === ListJoinType.NONE) {
            joinType = "SeparatorType.NONE";
        }
        return joinType;
    }

    private findNamedClassifiers(language: PiLanguage): PiClassifier[] {
        let result: PiClassifier[] = [];
        for( const elem of language.units) {
            if (hasNameProperty(elem)) {
                result.push(elem);
            }
        }
        for( const elem of language.concepts) {
            if (hasNameProperty(elem)) {
                result.push(elem);
            }
        }
        return result;
    }

    private makeWriteOnly(language: PiLanguage): string {
        const namedClassifiers: PiClassifier[] = this.findNamedClassifiers(language);
        const shortUnparsing: string = `
        // make sure the global variables are reset
                    this.output = [];
                    this.currentLine = 0;
                    // do not care about indent, we just need a single line
                    this.output[this.currentLine] = "";
                    // do the actual work
                    this.unparse(modelelement, true);
                    return this.output[0].trimEnd();`;
        if (namedClassifiers.length > 0) {
            return `${namedClassifiers.map((concept, index) => `
                ${index == 0 ? `` : `} else `}if (modelelement instanceof ${Names.classifier(concept)}) {
                    return modelelement.name;`).join("")}
                } else {
                    ${shortUnparsing}
                }`;
        } else {
            return `${shortUnparsing}`;
        }
    }
}
