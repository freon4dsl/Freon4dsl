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
    DefEditorConcept,
    DefEditorLanguage,
    DefEditorProjectionExpression,
    DefEditorProjectionIndent,
    DefEditorProjectionText,
    DefEditorSubProjection,
    Direction,
    ListJoinType,
    MetaEditorProjectionLine
} from "../../metalanguage";
import { langExpToTypeScript } from "../../../utils";

export class UnparserTemplate {
    constructor() {
    }

    generateUnparser(language: PiLanguage, editDef: DefEditorLanguage, relativePath: string): string {
        const allLangConcepts : string = Names.allConcepts(language);   
        const generatedClassName : String = Names.unparser(language);

        language.concepts.filter(elem => elem.implementedPrimProperties().some(p => p.name === "name"));

        // Template starts here 
        return `
        import { ${Names.PiNamedElement} } from "${PROJECTITCORE}";
        import { ${allLangConcepts}, ${Names.PiElementReference} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${language.concepts.map(concept => `
                ${concept.name}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";     
        // TODO change import to @project/core
        import { PiLogger } from "../../../../../core/src/util/PiLogging";
                
        const LOGGER = new PiLogger("${generatedClassName}");
        
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

            /**
             * Returns a string representation of 'modelelement'.
             * If 'short' is present and false, then a multi-line result will be given.
             * Otherwise, the result is always a single-line string.
             * @param modelelement
             * @param short
             */
            public unparse(modelelement: ${allLangConcepts}, short?: boolean) : string {
                // set default for optional parameter
                if (short === undefined) short = true;
                ${sortClasses(language.concepts).map(concept => `
                if(modelelement instanceof ${concept.name}) {
                    return this.unparse${concept.name}(modelelement, short);
                }`).join("")}
                return "";
            }

            ${editDef.conceptEditors.map(conceptDef => `${this.makeConceptMethod(conceptDef)}`).join("\n")}
               
            /**
             * Returns a string representation of 'list', using 'sepText' , and 'sepType' to include either a separator string 
             * or a terminator string. Param 'vertical' indicates whether the list should be represented vertically or horizontally.
             * If 'short' is false, then a multi-line result will be given. Otherwise, the result is always a single-line string.
             * @param list
             * @param sepText
             * @param sepType
             * @param vertical
             * @param short
             */         
            private unparseList(list: ${allLangConcepts}[], sepText: string, sepType: SeparatorType, vertical: boolean, short: boolean) : string {
                let result: string = "";
                list.forEach(listElem => {
                    result = result.concat(this.unparse(listElem, short));
                    if (sepType === SeparatorType.Separator) {
                        if (list.indexOf(listElem) !== list.length-1) result = result.concat(sepText);
                    }
                    if (sepType === SeparatorType.Terminator) {
                        result = result.concat(sepText);
                    }
                    if (vertical) result = result.concat("\\n");
                });
                return result;
            }

            /**
             * Returns a string representation of a list of references, where every reference
             * is replaced by a single-line representation of its referred element. The use of params 
             * 'sepText' and 'SepType' are equals to those in the private method unparseList.
             * @param list
             * @param sepText
             * @param sepType
             * @param vertical
             */
            private showReferenceList(list: ${Names.PiElementReference}<${Names.PiNamedElement}>[], sepText: string, sepType: SeparatorType, vertical: boolean) : string {
                let result: string = "";
                list.forEach(listElem => {
                    result = result.concat(this.unparse(listElem?.referred as ${allLangConcepts}, true));
                    if (sepType === SeparatorType.Separator) {
                        if (list.indexOf(listElem) !== list.length-1) result = result.concat(sepText);
                    }
                    if (sepType === SeparatorType.Terminator) {
                        result = result.concat(sepText);
                    }
                    if (vertical) result = result.concat("\\\\n");
                });
                return result;
            }
        } `;
    }

    private makeConceptMethod (conceptDef: DefEditorConcept ) : string {
        // console.log("creating unparse method for concept " + conceptDef.concept.name + ", editDef: " + (conceptDef.projection? conceptDef.projection.toString() : conceptDef.symbol));
        let myConcept: PiConcept = conceptDef.concept.referred;
        let name: string = myConcept.name;
        let lines: MetaEditorProjectionLine[] = conceptDef.projection?.lines;
        const comment =   `/**
                            * See the public unparse method.
                            */`;

        if (!!lines) {
            if (lines.length > 1) {
                return `
                ${comment}
                private unparse${name}(modelelement: ${name}, short: boolean) : string {
                    if (short) {
                        return \`${this.makeLine(lines[0])}\`
                    } else {
                        return \`${lines.map(line => `${this.makeLine(line)}`).join("\\n")}\`
                    }
                }`;
            } else {
                return `
                ${comment}
                private unparse${name}(modelelement: ${name}, short: boolean) : string {
                    return \`${this.makeLine(lines[0])}\`
                }`;
            }
        } else {
            if (myConcept instanceof  PiBinaryExpressionConcept && !!(conceptDef.symbol)) {
                return `${comment}
                    private unparse${name}(modelelement: ${name}, short: boolean) : string {
                    return \`\$\{this.unparse(modelelement.left, short)\} ${conceptDef.symbol} \$\{this.unparse(modelelement.right, short)\}\`;
                }`;
            }
            if (myConcept instanceof PiConcept && myConcept.isAbstract) {
                return `${comment}
                    private unparse${name}(modelelement: ${name}, short: boolean) : string {
                    return \`'unparse' should be implemented by subclasses of ${myConcept.name}\`;
                }`;
            }
            return '';
        }
    }

    private makeLine (line : MetaEditorProjectionLine) : string {
        // the result should be text or should end in a quote
        let result: string = "";
        // TODO indents are not correct because tabs are not yet recognised by the .edit parser
        // TODO indents should be aware of the indent of surrounding elements
        for (var _i = 0; _i < line.indent; _i++) {
            result += " ";
        }
        line.items.forEach((item, index) => {
            if (item instanceof DefEditorProjectionText) {
                // TODO escape all quotes in the text string
                result += `${item.text}`;
            }
            if (item instanceof DefEditorSubProjection) {
                let myElem = item.expression.findRefOfLastAppliedFeature();
                if (myElem instanceof PiPrimitiveProperty) {
                    result = this.makeItemWithPrimitiveType(myElem, result, item);
                } else {
                    result = this.makeItemWithConceptType(myElem, item, result);
                }
            }
            if (item instanceof DefEditorProjectionExpression) {
                // TODO implement this
            }
            if (item instanceof DefEditorProjectionIndent) {
                // TODO implement this
            }
            if (index < line.items.length - 1) result += ' '; // add a space between each item on a line
        });
        return result;
    }

    private makeItemWithPrimitiveType(myElem: PiPrimitiveProperty, result: string, item: DefEditorSubProjection) {
        // the expression is of primitive type
        if (myElem.isList) {
            result += `\$\{${langExpToTypeScript(item.expression)}.map(listElem => {
                                    ${langExpToTypeScript(item.expression)}
                                })\}`;
        } else {
            if (myElem.isOptional) { // surround the unparse call with an if-statement, because the element may not be present
                result += `\$\{${langExpToTypeScript(item.expression)} ? \``;
            }
            result += `\$\{${langExpToTypeScript(item.expression)}\}`;
            if (myElem.isOptional) { // end the if-statement
                result += `\` : \`none\` \}`;
            }
        }
        return result;
    }

    private makeItemWithConceptType(myElem: PiProperty, item: DefEditorSubProjection, result: string) {
        // the expression has a concept as type, thus we need to call its unparse method
        let type = myElem.type.referred;
        if (!!type) {
            if (myElem.isList) {
                let vertical = (item.listJoin.direction === Direction.Vertical);
                let joinType: string = "";
                if (item.listJoin.joinType === ListJoinType.Separator) {
                    joinType = "SeparatorType.Separator";
                }
                if (item.listJoin.joinType === ListJoinType.Terminator) {
                    joinType = "SeparatorType.Terminator";
                }
                if (myElem.isPart) {
                    result += `\$\{this.unparseList(${langExpToTypeScript(item.expression)}, "${item.listJoin.joinText}", ${joinType}, ${vertical}, short)\}`;
                } else {
                    result += `\$\{this.showReferenceList(${langExpToTypeScript(item.expression)}, "${item.listJoin.joinText}", ${joinType}, ${vertical})\}`;
                }
            } else {
                if (myElem.isOptional) { // surround the unparse call with an if-statement, because the element may not be present
                    result += `\$\{${langExpToTypeScript(item.expression)} ? \``;
                }
                if (myElem.isPart) {
                    result += `\$\{this.unparse(${langExpToTypeScript(item.expression)}, short)\}`;
                } else {
                    result += `\$\{${langExpToTypeScript(item.expression)}?.name\}`;
                }
                if (myElem.isOptional) { // end the if-statement
                    result += `\` : \`none\` \}`;
                }
            }
        }
        return result;
    }
}

