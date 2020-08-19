import { LANGUAGE_GEN_FOLDER, Names, PROJECTITCORE } from "../../../utils";
import {
    PiBinaryExpressionConcept,
    PiConcept,
    PiLanguage,
    PiPrimitiveProperty,
    PiProperty
} from "../../../languagedef/metalanguage/PiLanguage";
import { sortClasses } from "../../../utils/ModelHelpers";
import {
    PiEditConcept,
    PiEditUnit,
    PiEditProjectionText,
    PiEditSubProjection,
    PiEditProjectionDirection,
    ListJoinType,
    PiEditProjectionLine
} from "../../metalanguage";
import { langExpToTypeScript } from "../../../utils";

export class UnparserTemplate {

    /**
     * Returns a string representation of the class that implements an unparser for modelunits of
     * 'language', based on the given editor definition.
     */
    public generateUnparser(language: PiLanguage, editDef: PiEditUnit, relativePath: string): string {
        const allLangConcepts : string = Names.allConcepts(language);
        const generatedClassName : String = Names.unparser(language);

        // Template starts here
        return `
        import { ${Names.PiNamedElement} } from "${PROJECTITCORE}";
        import { ${allLangConcepts}, ${Names.PiElementReference}, ${language.concepts.map(concept => `
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
        export class ${generatedClassName}  {
            output: string[] = [];      // stores the result, one line per array element
            currentLine: number = 0;   // keeps track of the element in 'output' that we are working on

            /**
             * Returns a string representation of 'modelelement'.
             * If 'short' is present and false, then a multi-line result will be given.
             * Otherwise, the result is always a single-line string, which is used in
             * error messages.
             * Note that the single-line-string cannot be parsed into a correct model.
             * 
             * @param modelelement
             * @param startIndent
             * @param short
             */
            public unparse(modelelement: ${allLangConcepts}, startIndent?: number, short?: boolean) : string {
                this.unparseToLines(modelelement, startIndent, short);
                return \`\$\{this.output.map(line => \`\$\{line\}\`).join("\\n").trimRight()}\`;
            }
 
            /**
             * Returns a string representation of 'modelelement', divided into an array of strings,
             * each of which contain a single line (without newline).
             * If 'short' is present and false, then a multi-line result will be given.
             * Otherwise, the result is always a single-line string.
             *
             * @param modelelement
             * @param startIndent
             * @param short
             */
            public unparseToLines(modelelement: ${allLangConcepts}, startIndent?: number, short?: boolean): string[] {
                // set default for optional parameters
                if (startIndent === undefined) {
                    startIndent = 0;
                }
                if (short === undefined) {
                    short = true;
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
                this.unparsePrivate(modelelement, short);
                return this.output;
            }
        
            private unparsePrivate(modelelement: ${allLangConcepts}, short: boolean) {
                ${sortClasses(language.concepts).map(concept => `
                if(modelelement instanceof ${Names.concept(concept)}) {
                    this.unparse${Names.concept(concept)}(modelelement, short);
                    return;
                }`).join("")}
            }

            ${editDef.conceptEditors.map(conceptDef => `${this.makeConceptMethod(conceptDef)}`).join("\n")}
               
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
                    this.unparsePrivate(listElem, short);
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
                    this.output[this.currentLine] += listElem.name;
                    this.doSeparatorOrTerminatorAndNewline(sepType, isLastInList, sepText, vertical, short, indent);
                });
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
            private unparseListOfPrimitiveValues(
                list: (string | number | boolean)[],
                sepText: string,
                sepType: SeparatorType,
                vertical: boolean,
                indent: number,
                short: boolean
            ) {
                list.forEach((listElem, index) => {
                    const isLastInList: boolean = index === list.length - 1;
                    if (typeof listElem === "string") {
                        this.output[this.currentLine] += \`\"\$\{listElem\}\"\`;
                    } else {
                        this.output[this.currentLine] += \`\$\{listElem\}\`;
                    }
                    this.doSeparatorOrTerminatorAndNewline(sepType, isLastInList, sepText, vertical, short, indent);
                });
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
                }
                if (vertical && !isLastInList) {
                    if (!short) {
                        this.newlineAndIndentation(indent);
                    } else { // stop after 1 line
                        // note that the following cannot be parsed
                        this.output[this.currentLine] += \` ...\`;
                        return;
                    }
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
     * 'conceptDef'.
     * @param conceptDef
     */
    private makeConceptMethod (conceptDef: PiEditConcept ) : string {
        let myConcept: PiConcept = conceptDef.concept.referred;
        let name: string = Names.concept(myConcept);
        let lines: PiEditProjectionLine[] = conceptDef.projection?.lines;
        const comment =   `/**
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
                        this.output[this.currentLine] += "( ";
                        this.unparsePrivate(modelelement.left, short);
                        this.output[this.currentLine] += "${conceptDef.symbol} ";
                        this.unparsePrivate(modelelement.right, short);
                        this.output[this.currentLine] += ") ";
                }`;
            }
            if (myConcept instanceof PiConcept && myConcept.isAbstract) {
                return `${comment}
                    private unparse${name}(modelelement: ${name}, short: boolean) {
                        this.output[this.currentLine] += \`'unparse' should be implemented by subclasses of ${myConcept.name}\`;
                }`;
            }
            return '';
        }
    }

    /**
     * Creates the statements needed to unparse a single line in an editor projection definition
     * @param line
     */
    private makeLine (line : PiEditProjectionLine) : string {
        let result: string = ``;
        // TODO indents are not completely correct because tabs are not yet recognised by the .edit parser

        line.items.forEach((item) => {
            if (item instanceof PiEditProjectionText) {
                // TODO escape all quotes in the text string, when we know how they are stored in the projection
                result += `this.output[this.currentLine] += \`${item.text.trimRight()} \`;\n`;
            } else if (item instanceof PiEditSubProjection) {
                let myElem = item.expression.findRefOfLastAppliedFeature();
                if (myElem instanceof PiPrimitiveProperty) {
                    result += this.makeItemWithPrimitiveType(myElem, item);
                } else {
                    result += this.makeItemWithConceptType(myElem, item, line.indent);
                }
            }
        });
        return result;
    }

    /**
     * Creates the statements needed to unparse lines[1] till lines[lines.length -1], as well as
     * the statements needed to generate newlines and indentation.
     * @param lines
     */
    private makeRemainingLines(lines: PiEditProjectionLine[]): string {
        let first = true;
        let result: string = '';
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
     * Creates the statement neede to unparse an element with primitive type. The element may be a list or
     * a single property.
     * @param myElem
     * @param item
     */
    private makeItemWithPrimitiveType(myElem: PiPrimitiveProperty, item: PiEditSubProjection): string {
        // the expression is of primitive type
        let result: string = ``;
        const elemStr = langExpToTypeScript(item.expression);
        if (myElem.isList) {
            // TODO remove this hack when the edit def holds lists of primitive values
            result += `this.unparseListOfPrimitiveValues(
                    ${elemStr}, ", ", SeparatorType.Separator, false, 
                    this.output[this.currentLine].length,
                    short
                );`;
            // should be:
            // let vertical = (item.listJoin.direction === PiEditProjectionDirection.Vertical);
            // let joinType = this.getJoinType(item);
            // result += `this.unparseListOfPrimitiveValues(
            //         ${elemStr}, "${item.listJoin.joinText}", ${joinType}, ${vertical},
            //         this.output[this.currentLine].length,
            //         short
            //     );`;
            // end hack
        } else {
            let myCall: string = ``;
            // TODO remove this hack: test on "myElem.name !== "name" ", when a difference is made between identifiers and strings
            if (myElem.primType === "string" && myElem.name !== "name") {
                myCall = `this.output[this.currentLine] += \`\"\$\{${elemStr}\}\" \``;
            } else {
                myCall = `this.output[this.currentLine] += \`\$\{${elemStr}\} \``;
            }
            if (myElem.isOptional) { // surround the unparse call with an if-statement, because the element may not be present
                result += `if (!!${elemStr}) { ${myCall} }`;
            } else {
                result += myCall;
            }
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
    private makeItemWithConceptType(myElem: PiProperty, item: PiEditSubProjection, indent: number) {
        // the expression has a concept as type, thus we need to call its unparse method
        let result: string = "";
        let type = myElem.type.referred;
        if (!!type) {
            var myTypeScript: string = langExpToTypeScript(item.expression);
            if (myElem.isList) {
                let vertical = (item.listJoin.direction === PiEditProjectionDirection.Vertical);
                let joinType = this.getJoinType(item);

                if (myElem.isPart) {
                    result += `this.unparseList(${myTypeScript}, "${item.listJoin.joinText}", ${joinType}, ${vertical}, this.output[this.currentLine].length, short) `;
                } else {
                    result += `this.unparseReferenceList(${myTypeScript}, "${item.listJoin.joinText}", ${joinType}, ${vertical}, this.output[this.currentLine].length, short) `;
                }
            } else {
                let myCall: string = "";
                if (myElem.isPart) {
                    myCall += `this.unparsePrivate(${myTypeScript}, short) `;
                } else {
                    // TODO remove this hack as soon as TODO in ModelHelpers.langExpToTypeScript is resolved.
                    // remove only the last ".referred"
                    if (myTypeScript.endsWith("?.referred") ) {
                        myTypeScript = myTypeScript.substring(0, myTypeScript.length - 10);
                    } else if (myTypeScript.endsWith(".referred") ) {
                        myTypeScript = myTypeScript.substring(0, myTypeScript.length - 9);
                    }

                    myCall += `this.output[this.currentLine] += \`\$\{${myTypeScript}.name\} \``;
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

    /**
     * Changes the jointype in 'item' into the text needed in the unparser.
     * @param item
     */
    private getJoinType(item: PiEditSubProjection): string {
        let joinType: string = "";
        if (item.listJoin.joinType === ListJoinType.Separator) {
            joinType = "SeparatorType.Separator";
        } else if (item.listJoin.joinType === ListJoinType.Terminator) {
            joinType = "SeparatorType.Terminator";
        }
        return joinType;
    }
}

