import {
    LANGUAGE_GEN_FOLDER,
    Names,
    PROJECTITCORE,
    ListUtil,
    GenerationUtil
} from "../../utils";
import {
    FreBinaryExpressionConcept, FreClassifier,
    FreConcept, FreInterface,
    FreLanguage, FreLimitedConcept,
    FrePrimitiveProperty,
    FreProperty
} from "../../languagedef/metalanguage";
import {
    FreEditUnit,
    FreEditProjectionText,
    FreEditPropertyProjection,
    FreEditProjectionDirection,
    ListJoinType,
    FreEditProjectionLine,
    FreEditProjectionItem,
    FreEditProjection,
    FreEditClassifierProjection,
    FreOptionalPropertyProjection, ExtraClassifierInfo, FreEditSuperProjection
} from "../../editordef/metalanguage";
import { FrePrimitiveType } from "../../languagedef/metalanguage";
import { ParserGenUtil } from "./ParserGenUtil";
import { FreEditProjectionGroup } from "../../editordef/metalanguage";

// TODO more preconditions should be added to avoid null pointer errors

export class WriterTemplate {
    private currentProjectionGroup: FreEditProjectionGroup = null;
    // namedProjections is the list of projections with a different name than the current projection group
    // this list is filled during the build of the template and should alwyas be the last
    // to added to the template
    private namedProjections: FreEditClassifierProjection[] = [];
    private trueValue: string = 'true';
    private falseValue: string = 'false';
    private refSeparator: string = ".";

    /**
     * Returns a string representation of the class that implements an unparser for modelunits of
     * 'language', based on the given editor definition.
     */
    public generateUnparser(language: FreLanguage, editDef: FreEditUnit, relativePath: string): string {
        // first initialize the class variables
        this.namedProjections = [];
        this.currentProjectionGroup = ParserGenUtil.findParsableProjectionGroup(editDef);

        const stdBoolKeywords = editDef.getDefaultProjectiongroup().standardBooleanProjection;
        if (!!stdBoolKeywords) {
            this.trueValue = stdBoolKeywords.trueKeyword;
            this.falseValue = stdBoolKeywords.falseKeyword;
        }
        const refSeparator = editDef.getDefaultProjectiongroup().standardReferenceSeparator;
        if (!!refSeparator) {
            this.refSeparator = refSeparator;
        }

        // next, do some admin: which concepts should be generated as what?
        const allLangConceptsName: string = Names.allConcepts(language);
        const generatedClassName: String = Names.writer(language);
        const writerInterfaceName: string = Names.FreWriter;
        let limitedConcepts: FreLimitedConcept[] = language.concepts.filter(c => c instanceof FreLimitedConcept) as FreLimitedConcept[];
        const conceptsToUnparse: FreClassifier[] = [];
        conceptsToUnparse.push(...language.concepts);
        conceptsToUnparse.push(...language.units);

        // find all concepts that are not limited, and do not have a projection
        // this should be only abstract concepts
        const conceptsWithoutProjection: FreClassifier[] = conceptsToUnparse
            .filter(c => !(c instanceof FreLimitedConcept)) // handled in list 'limitedConcepts'
            .filter(c => !(c instanceof FreBinaryExpressionConcept && !c.isAbstract)) // handled in list 'binaryExtras'
            .filter(c => {
                const projection: FreEditClassifierProjection[] = editDef.findProjectionsForType(c);
                return projection === undefined || projection === null || projection.length === 0;
            });

        // find all interfaces that do not have a projection
        const interfacesWithoutProjection: FreInterface[] = language.interfaces.filter(c => {
            const projection: FreEditClassifierProjection[] = editDef.findProjectionsForType(c);
            return projection === undefined || projection === null || projection.length === 0;
        });

        const binaryExtras: ExtraClassifierInfo[] = [];
        if (!!this.currentProjectionGroup.extras) {
            for (const myExtra of this.currentProjectionGroup.extras) {
                const myConcept: FreClassifier = myExtra.classifier.referred;
                if (myConcept instanceof FreBinaryExpressionConcept && !myConcept.isAbstract) {
                    binaryExtras.push(myExtra);
                }
            }
        }

        // Template starts here
        return `
        import { ${Names.FreNamedNode}, ${Names.FreNodeReference}, ${writerInterfaceName} } from "${PROJECTITCORE}";
        import { ${allLangConceptsName}, 
            ${language.interfaces.length > 0
            ? language.interfaces.map(concept => `
                ${Names.classifier(concept)}, `).join("")
            : ``}
            ${language.units.map(concept => `
                ${Names.classifier(concept)}`).join(", ")},
            ${language.concepts.map(concept => `
                    ${Names.concept(concept)}`).join(", ")}                               
        } from "${relativePath}${LANGUAGE_GEN_FOLDER }";     
        
        /**
         * SeparatorType is used to unparse lists.
         * NONE means only space(s) between the elements.
         * Terminator means that every element is terminated with a certain string.
         * Separator means that in between elements a certain string is placed.
         */
        enum SeparatorType {
            NONE = "NONE",
            Terminator = "Terminator",
            Separator = "Separator",
            Initiator ="Initiator",
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
            public writeToString(modelelement: ${allLangConceptsName}, startIndent?: number, short?: boolean) : string {
                this.writeToLines(modelelement, startIndent, short);
                return \`\$\{this.output.map(line => \`\$\{line.trimEnd()\}\`).join("\\n").trimEnd()}\`;
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
            public writeToLines(modelelement: ${allLangConceptsName}, startIndent?: number, short?: boolean): string[] {
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
            public writeNameOnly(modelelement: ${allLangConceptsName}): string {
                if (!modelelement) return '';
                ${this.makeWriteOnly(language)}
            }
        
            private unparse(modelelement: ${allLangConceptsName}, short: boolean) {
                if (!modelelement) return;
                switch (modelelement.freLanguageConcept()) {
                ${conceptsToUnparse.map(concept =>
                `case "${Names.classifier(concept)}": this.unparse${Names.classifier(concept)}(modelelement as ${Names.classifier(concept)}, short);
                break;`
                ).join("\n")}
                ${language.interfaces.map(concept =>
                `case "${Names.classifier(concept)}": this.unparse${Names.classifier(concept)}(modelelement as ${Names.classifier(concept)}, short);
                break;`
                ).join("\n")}
                }
            }

            ${this.currentProjectionGroup.projections.map(conceptDef => `${this.makeConceptMethod(conceptDef)}`).join("\n")}
            ${binaryExtras.map(bin => `${this.makeBinaryExpMethod(bin)}`).join("\n")}
            ${limitedConcepts.map(con => `${this.makeLimitedMethod(con)}`).join("\n")}
            ${conceptsWithoutProjection.map(concept => `${this.makeAbstractConceptMethodWithout(concept)}`).join("\n")}
            ${interfacesWithoutProjection.map(intf => `${this.makeInterfaceMethod(intf, Names.allConcepts(language))}`).join("\n") }
            ${this.namedProjections.map(projection => `${this.makeConceptMethod(projection)}`).join("\n")}
             
            /**
             *
            */
            private unparseReference(modelelement: ${Names.FreNodeReference}<${Names.FreNamedNode}>, short: boolean) {
                if (!!modelelement) {
                    const type: ${Names.FreNamedNode} = modelelement?.referred;
                    if (!!type) {
                        ${limitedConcepts.length > 0 
                        ? 
                            `${limitedConcepts.map((lim, index) =>
                            `${index == 0 ? `` : `} else `}if (type instanceof ${Names.concept(lim)}) {
                                this.unparse${Names.concept(lim)}(type, short);`).join("")}
                            } else {
                                this.output[this.currentLine] += modelelement.pathnameToString("${this.refSeparator}") + " ";
                            }`
                        :
                            `this.output[this.currentLine] += modelelement.pathnameToString("${this.refSeparator}") + " ";`
                        }
                    } else {
                        this.output[this.currentLine] += modelelement.pathnameToString("${this.refSeparator}") + " ";
                    }
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
            private unparseList(list: ${allLangConceptsName}[], sepText: string, sepType: SeparatorType, vertical: boolean, indent: number, short: boolean,
        method: (modelelement: ${allLangConceptsName}, short: boolean) => void) {
                list.forEach((listElem, index) => {
                    const isLastInList: boolean = index === list.length - 1;
                    this.doInitiator(sepText, sepType);
                    method(listElem, short);
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
            private unparseReferenceList(list: ${Names.FreNodeReference}<${Names.FreNamedNode}>[], sepText: string, sepType: SeparatorType, vertical: boolean, indent: number, short: boolean) {
                list.forEach((listElem, index) => {
                    const isLastInList: boolean = index === list.length - 1;     
                    this.doInitiator(sepText, sepType);              
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
             * Adds a separator, terminator, or initiator text (followed or preceded by a newline and the right amount of indentation) 
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
                this.output[this.currentLine] = this.output[this.currentLine].trimEnd();
                
                if (!vertical && (!sepText || sepText.length == 0)) {
                    // at least separate the items by a space to avoid things
                    // like "IntegerFunction", which should be "Integer Function"
                    sepText = " ";
                }
                
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
                    case SeparatorType.Initiator: {
                        break;
                    }
                    case SeparatorType.NONE: {
                        if (!vertical) {
                            // at least separate the items by a space to avoid things
                            // like "IntegerFunction", which should be "Integer Function"
                            this.output[this.currentLine] += " ";
                        }
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
                } else if (isLastInList) {
                    // end with a space to avoid things
                    // like "666after", which should be "666 after"
                    if (this.output[this.currentLine][this.output[this.currentLine].length-1] !== " ") {
                        this.output[this.currentLine] += \` \`;
                    }
                }
            }
        
            /**
             * Makes a new entry in the 'output' array
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
 
             /**
             * Adds the 'initiator' text  
             * @param sepText
             * @param sepType
             * @private
             */           
            private doInitiator(sepText: string, sepType: SeparatorType) {
                if (sepType === SeparatorType.Initiator) {
                    this.output[this.currentLine] += sepText;
                }
            }           
        } `;
    }

    /**
     * Creates a method that unparses the concept in 'conceptDef' based on the projection in
     * 'conceptDef'.
     * @param projection
     */
    private makeConceptMethod (projection: FreEditClassifierProjection): string {
        const myConcept: FreClassifier = projection.classifier.referred;
        if (projection instanceof FreEditProjection) {
            if (myConcept instanceof FreBinaryExpressionConcept) {
                // do nothing, binary expressions are treated differently
            } else {
                return this.makeNormalMethod(projection, myConcept);
            }
        } // else if (conceptDef instanceof FreEditTableProjection) {
        // cannot unparse a table projection
        return "";
    }

    private makeLimitedMethod(myConcept: FreLimitedConcept) {
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

    private makeAbstractMethod(myConcept: FreConcept): string {
        const name: string = Names.concept(myConcept);
        return `/**
                 * The abstract concept '${myConcept.name}' is not unparsed.
                 */
                private unparse${name}(modelelement: ${name}, short: boolean) {
                    throw new Error('Method unparse${name} should be implemented by its (concrete) subclasses.');
                }`;
    }

    private makeNormalMethod(projection: FreEditProjection, myConcept: FreClassifier) {
        const name: string = Names.classifier(myConcept);
        const lines: FreEditProjectionLine[] = projection.lines;
        const comment = `/**
                          * Unparsing of '${name}' according to projection '${projection.name}'.
                          */`;
        // take care of named projections, the unparse method gets a different name
        let methodName: string = `unparse${name}`;
        if (projection.name != this.currentProjectionGroup.name) {
            methodName += "_" + projection.name;
        }
        if (!!lines) {
            if (lines.length > 1) {
                return `
                ${comment}
                private ${methodName}(modelelement: ${name}, short: boolean) {
                    const blockIndent = this.output[this.currentLine].length;
                    // do the first line
                    ${this.makeLine(lines[0], false)}
                    if (!short) { // do the rest of the lines as well
                        ${this.makeRemainingLines(lines)}
                    }
                }`;
            } else {
                if (!!lines[0].items.find(item => item instanceof FreOptionalPropertyProjection)) {
                    // add blockIndent, it is used in the Optional part
                    return `
                        ${comment}
                        private ${methodName}(modelelement: ${name}, short: boolean) {
                            const blockIndent = this.output[this.currentLine].length;
                            ${this.makeLine(lines[0], false)}
                        }`;
                } else {
                    return `
                        ${comment}
                        private ${methodName}(modelelement: ${name}, short: boolean) {
                            ${this.makeLine(lines[0], false)}
                        }`;
                }
            }
        } else {
            if (myConcept instanceof FreConcept && myConcept.isAbstract) {
                return `${comment}
                    private ${methodName}(modelelement: ${name}, short: boolean) {
                        this.output[this.currentLine] += \`'unparse' should be implemented by subclasses of ${myConcept.name}\`;
                }`;
            }
            return "";
        }
    }

    /**
     * Creates the statements needed to unparse a single line in an editor projection definition
     * @param line
     * @param inOptionalGroup
     * @private
     */
    private makeLine(line: FreEditProjectionLine, inOptionalGroup: boolean): string {
        let result: string = ``;
        if (line.isEmpty()) {
            result = `this.output[this.currentLine] += "\"\n\"";`
        } else {
            line.items.forEach(item => {
                result += this.makeItem(item, line.indent, inOptionalGroup, line.isOptional());
            });
        }
        return result;
    }

    private makeItem(item: FreEditProjectionItem, indent: number, inOptionalGroup: boolean, lineIsOptional: boolean): string {
        let result: string = ``;
        if (item instanceof FreEditProjectionText) {
            // add escapes to item.text
            const myText = ParserGenUtil.escapeRelevantChars(item.text).trimEnd();
            result += `this.output[this.currentLine] += \`${myText} \`;\n`;
        } else if (item instanceof FreOptionalPropertyProjection){
            const myElem = item.property.referred;
            let myTypeScript: string = GenerationUtil.propertyToTypeScript(myElem);
            if (!myElem.isPart) {
                myTypeScript = GenerationUtil.propertyToTypeScriptWithoutReferred(item.property.referred);
            }
            if (myElem.isList) {
                myTypeScript += " && " + myTypeScript + '.length > 0';
            }
            let subresult: string = "";
            item.lines.forEach((line, index) => {
                if (index === 0) {
                    if (lineIsOptional) {
                        // the indent and newline needs to be within the optional if-stat
                        // because otherwise there will be empty lines in the output of the unparser
                        subresult += `this.newlineAndIndentation(blockIndent + ${indent} + ${line.indent});`;
                    }
                    subresult += this.makeLine(line, true);
                } else
                    subresult += `this.newlineAndIndentation(blockIndent + ${indent} + ${line.indent});
                           ${this.makeLine(line, true)}`;
            });
            // surround whole sub-projection with an if-statement
            result += `if (!!${myTypeScript}) { ${subresult} }`;
        } else if (item instanceof FreEditPropertyProjection) {
            const myElem = item.property.referred;
            if (myElem instanceof FrePrimitiveProperty) {
                result += this.makeItemWithPrimitiveType(myElem, item, inOptionalGroup);
            } else {
                result += this.makeItemWithConceptType(myElem, item, indent, inOptionalGroup);
            }
        } else if (item instanceof FreEditSuperProjection) {
            // take care of named projection
            if (!!item.projectionName && item.projectionName.length > 0 && item.projectionName !== this.currentProjectionGroup.name) {
                // find the projection that we need and add it to the extra list
                ListUtil.addIfNotPresent<FreEditClassifierProjection>(this.namedProjections, ParserGenUtil.findNonTableProjection(this.currentProjectionGroup, item.superRef.referred, item.projectionName));
                result += `this.unparse${Names.classifier(item.superRef.referred)}_${item.projectionName}(modelelement, short);`;
            } else { // use the normal unparse method
                result += `this.unparse${Names.classifier(item.superRef.referred)}(modelelement, short);`;
            }
        }
        return result;
    }
    /**
     * Creates the statements needed to unparse lines[1] till lines[lines.length -1], as well as
     * the statements needed to generate newlines and indentation.
     * @param lines
     */
    private makeRemainingLines(lines: FreEditProjectionLine[]): string {
        let first = true;
        let result: string = "";
        lines.forEach(line => {
            if (first) { // skip the first line, this is already taken care of in 'makeConceptMethod'
                first = false;
            } else {
                // we need to include an indent and newline within an optional if-stat
                // because these would otherwise result in empty lines in the output of the unparser
                // therefore we need to know whether the next item is an optional one
                if (line.items[0] instanceof FreOptionalPropertyProjection) {
                    result += this.makeLine(line, false);
                } else {
                    result += `this.newlineAndIndentation(blockIndent + ${line.indent});
                           ${this.makeLine(line, false)}`;
                }
            }
        });
        return result;
    }

    /**
     * Creates the statement needed to unparse an element with primitive type. The element may be a list or
     * a single property.
     * @param myElem
     * @param item
     * @param inOptionalGroup
     */
    private makeItemWithPrimitiveType(myElem: FrePrimitiveProperty, item: FreEditPropertyProjection, inOptionalGroup: boolean): string {
        // the property is of primitive type
        let result: string = ``;
        const elemStr = GenerationUtil.propertyToTypeScript(item.property.referred);
        if (myElem.isList) {
            let isIdentifier: string = "false";
            if (myElem.type === FrePrimitiveType.identifier) {
                isIdentifier = "true";
            }
            const vertical = (item.listInfo.direction === FreEditProjectionDirection.Vertical);
            const joinType = this.getJoinType(item);
            if (!item.listInfo.isTable) { // it is a list not table
                // add escapes to joinText
                let myJoinText = ParserGenUtil.escapeRelevantChars(item.listInfo.joinText);
                // Add a space to the join text. This is needed in a text string, not in a projectional editor.
                myJoinText = (!!myJoinText && myJoinText.length > 0) ? myJoinText + ' ' : '';
                result += `this.unparseListOfPrimitiveValues(
                    ${elemStr}, ${isIdentifier},"${myJoinText}", ${joinType}, ${vertical},
                    this.output[this.currentLine].length,
                    short
                );`;
            }
        } else {
            let myCall: string;
            const myType: FreClassifier = myElem.type;
            if (myType === FrePrimitiveType.string ) {
                myCall = `this.output[this.currentLine] += \`\"\$\{${elemStr}\}\" \``;
            } else if (myType === FrePrimitiveType.boolean) {
                // get the right manner to unparse the boolean values
                // either from the standard boolean keywords in the default projection group
                // or from 'item', and add escapes to the keywords
                let myTrueKeyword: string = ParserGenUtil.escapeRelevantChars(this.trueValue);
                let myFalseKeyword: string = ParserGenUtil.escapeRelevantChars(this.falseValue);
                if (!!item.boolInfo) {
                    myTrueKeyword = ParserGenUtil.escapeRelevantChars(item.boolInfo.trueKeyword);
                    if (!!item.boolInfo.falseKeyword) {
                        myFalseKeyword = ParserGenUtil.escapeRelevantChars(item.boolInfo.falseKeyword);
                    } else {
                        myFalseKeyword = null;
                    }
                }
                if (myTrueKeyword === 'true' && myFalseKeyword === 'false') {
                    // possibility 1: the keywords are simply 'true' and 'false'
                    myCall = `this.output[this.currentLine] += \`\$\{${elemStr}\} \``;
                } else if (myFalseKeyword === null) {
                    // possibility 2: there is no false keyword, which means that
                    // the boolean value should be shown only when it is true
                    myCall = `if (${elemStr}) { 
                              this.output[this.currentLine] += \`${myTrueKeyword} \`
                          }`;
                } else {
                    // possibility 3: both true and false keywords have been altered in the editor definition
                    myCall = `if (${elemStr}) { 
                              this.output[this.currentLine] += \`${myTrueKeyword} \`
                          } else {
                            this.output[this.currentLine] += \`${myFalseKeyword} \`
                          }`;
                }
                // if (!!item.boolInfo.falseKeyword) {
                //     // add unparsing for two keywords
                //
                // } else {
                //     myCall = `if (${elemStr}) {
                //               this.output[this.currentLine] += \`${myTrueKeyword} \`
                //           }`;
                // }
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
     * @param inOptionalGroup
     */
    private makeItemWithConceptType(myElem: FreProperty, item: FreEditPropertyProjection, indent: number, inOptionalGroup: boolean) {
        // the property has a concept as type, thus we need to call its unparse method
        let result: string = "";
        const type = myElem.type;
        let nameOfUnparseMethod: string = "unparse";
        let typeCast: string = '';
        if (!!type) {
            // In case of a named projection, another unparse method needs to be called,
            // and the parameter to that call needs a type cast.
            // The projection that must be implemented in this new unparse method is stored
            // in 'this.namedProjections'. All elements in this list are added to the generated class
            // when all 'normal' methods have been generated - so we know all extra methods needed.
            // Note that the name of the call generated here must be equal to the name of the method
            // which is generated in 'makeNormalMethod'.
            if (!!item.projectionName && item.projectionName.length > 0 && item.projectionName !== this.currentProjectionGroup.name) {
                // find the projection that we need and add it to the extra list
                const foundProjection = ParserGenUtil.findNonTableProjection(this.currentProjectionGroup, type, item.projectionName);
                ListUtil.addIfNotPresent<FreEditClassifierProjection>(this.namedProjections, foundProjection);
                nameOfUnparseMethod += `${Names.classifier
                (type)}_${item.projectionName}`;
                typeCast = ` as ${Names.classifier(type)}`;
            }
            if (myElem.isList) {
                if (!!item.listInfo && !item.listInfo.isTable) { // it is a list not table
                    const vertical = (item.listInfo.direction === FreEditProjectionDirection.Vertical);
                    const joinType: string = this.getJoinType(item);
                    if (joinType.length > 0) {
                        // Add a space to the join text. This is needed in a text string, not in a projectional editor.
                        const myJoinText: string = (!!item.listInfo.joinText && item.listInfo.joinText.length > 0) ? item.listInfo.joinText + ' ' : '';
                        if (myElem.isPart) {
                            let myTypeScript: string = GenerationUtil.propertyToTypeScript(item.property.referred);
                            result += `this.unparseList(${myTypeScript}, "${myJoinText}", ${joinType}, ${vertical}, this.output[this.currentLine].length, short,
                            (modelelement, short) => this.${nameOfUnparseMethod}(modelelement${typeCast}, short) )`;
                        } else {
                            let myTypeScript: string = GenerationUtil.propertyToTypeScriptWithoutReferred(item.property.referred);
                            result += `this.unparseReferenceList(${myTypeScript}, "${myJoinText}", ${joinType}, ${vertical}, this.output[this.currentLine].length, short) `;
                        }
                    }
                }
            } else {
                let myCall: string = "";
                let myTypeScript: string;
                if (myElem.isPart) {
                    myTypeScript = GenerationUtil.propertyToTypeScript(item.property.referred);
                    myCall += `this.${nameOfUnparseMethod}(${myTypeScript}, short) `;
                } else {
                    myTypeScript = GenerationUtil.propertyToTypeScriptWithoutReferred(item.property.referred);
                    myCall += `this.unparseReference(${myTypeScript}, short);`;
                }
                if (myElem.isOptional && !inOptionalGroup) { // surround the unparse call with an if-statement, because the element may not be present
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
    private getJoinType(item: FreEditPropertyProjection): string {
        let joinType: string = "SeparatorType.NONE";
        if (!!item.listInfo) {
            if (item.listInfo.joinType === ListJoinType.Separator) {
                joinType = "SeparatorType.Separator";
            } else if (item.listInfo.joinType === ListJoinType.Terminator) {
                joinType = "SeparatorType.Terminator";
            } else if (item.listInfo.joinType === ListJoinType.Initiator) {
                joinType = "SeparatorType.Initiator";
            // } else if (item.listInfo.joinType === ListJoinType.NONE) {
            //     joinType = "SeparatorType.NONE";
            }
        }
        return joinType;
    }

    private findNamedClassifiers(language: FreLanguage): FreClassifier[] {
        let result: FreClassifier[] = [];
        for( const elem of language.units) {
            if (GenerationUtil.hasNameProperty(elem)) {
                result.push(elem);
            }
        }
        for( const elem of language.concepts) {
            if (GenerationUtil.hasNameProperty(elem)) {
                result.push(elem);
            }
        }
        return result;
    }

    private makeWriteOnly(language: FreLanguage): string {
        const namedClassifiers: FreClassifier[] = this.findNamedClassifiers(language);
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

    private makeBinaryExpMethod(myConcept: ExtraClassifierInfo) {
        const name: string = Names.classifier(myConcept.classifier.referred);
        const comment = `/**
                          * See the public unparse method.
                          */`;
        if (!!(myConcept.symbol)) {
            return `${comment}
            private unparse${name}(modelelement: ${name}, short: boolean) {
                this.unparse(modelelement.left, short);
                this.output[this.currentLine] += "${myConcept.symbol} ";
                this.unparse(modelelement.right, short);
        }`;
        }
        return '';
    }

    private makeInterfaceMethod(piInterface: FreInterface, classifierType: string): string {
        const name: string = Names.interface(piInterface);
        return `/**
                 * The interface '${piInterface.name}' is not unparsed.
                 */
                private unparse${name}(modelelement: ${classifierType}, short: boolean) {
                    throw new Error('Method unparse${name} should be implemented by the classes that implement it.');
                }`;
    }

    private makeAbstractConceptMethodWithout(concept: FreClassifier): string {
        if (concept instanceof FreConcept && concept.isAbstract) {
            return this.makeAbstractMethod(concept);
        } else {
            console.log("INTERNAL ERROR: concept without projection is not abstract or limited: " + concept.name);
        }
        return '';
    }
}
