import { LANGUAGE_GEN_FOLDER, Names } from "../../../utils";
import {
    PiBinaryExpressionConcept,
    PiConcept,
    PiLanguageUnit,
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

    generateUnparser(language: PiLanguageUnit, editDef: DefEditorLanguage, relativePath: string): string {
        const allLangConcepts : string = Names.allConcepts(language);   
        const generatedClassName : String = Names.unparser(language);
        // TODO change comment before class

        // Template starts here 
        return `
        import { PiNamedElement } from "@projectit/core";
        import { ${allLangConcepts} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${language.concepts.map(concept => `
                ${concept.name}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";     
        // TODO change import to @project/core
        import { PiLogger } from "../../../../../core/src/util/PiLogging";
                
        const LOGGER = new PiLogger("${generatedClassName}");
        
        enum SeparatorType {
            NONE = "NONE",
            Terminator = "Terminator",
            Separator = "Separator"
        }

        export class ${generatedClassName}  {

            public unparse(modelelement: ${allLangConcepts}) : string {
                ${sortClasses(language.concepts).map(concept => `
                if(modelelement instanceof ${concept.name}) {
                    return this.unparse${concept.name}(modelelement);
                }`).join("")}
                return "";
            }

            ${editDef.conceptEditors.map(conceptDef => `${this.makeConceptMethod(conceptDef)}`).join("\n")}
                        
            private unparseList(list: ${allLangConcepts}[], sepText: string, sepType: SeparatorType, vertical: boolean) : string {
                let result: string = "";
                list.forEach(listElem => {
                    result = result.concat(this.unparse(listElem));
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

            private showReferenceList(list: ${allLangConcepts}[], sepText: string, sepType: SeparatorType, vertical: boolean) : string {
                let result: string = "";
                list.forEach(listElem => {
                    result = result.concat((listElem as PiNamedElement)?.name);
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

        if (!!lines) {
            return `
                private unparse${name}(modelelement: ${name}) : string {
                    return \`${lines.map(line => `${this.makeLine(line)}` ).join("\\n")}\`
                }`;
        } else {
            if (myConcept instanceof  PiBinaryExpressionConcept && !!(conceptDef.symbol)) {
                return `private unparse${name}(modelelement: ${name}) : string {
                    return \`\$\{this.unparse(modelelement.left)\} ${conceptDef.symbol} \$\{this.unparse(modelelement.right)\}\`;
                }`;
            }
            if (myConcept instanceof PiConcept && myConcept.isAbstract) {
                return `private unparse${name}(modelelement: ${name}) : string {
                    return \`'unparse' should be implemented by subclasses of ${myConcept.name}\`;
                }`;
            }
            return '';
        }
    }

    private makeLine (line : MetaEditorProjectionLine) : string {
        // the result should be text or should end in a quote
        let result: string = "";
        for (var _i = 0; _i < line.indent; _i++) {
            result += " ";
        }
        line.items.forEach((item, index) => {
            if (item instanceof DefEditorProjectionText) {
                // TODO escape all quotes in the text string
                result += `${item.text}`;
            }
            if (item instanceof DefEditorSubProjection) {
                // TODO take optionality into account
                let myElem = item.expression.findRefOfLastAppliedFeature();
                if (myElem instanceof PiPrimitiveProperty) {
                    result = this.makeItemWithPrimitiveType(myElem, result, item);
                } else {
                    result = this.makeItemWithConceptType(myElem, item, result);
                }
            }
            if (item instanceof DefEditorProjectionExpression) {
                // TODO implement this
                // console.log(item)
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
                    result += `\$\{this.unparseList(${langExpToTypeScript(item.expression)}, "${item.listJoin.joinText}", ${joinType}, ${vertical})\}`;
                } else {
                    result += `\$\{this.showReferenceList(${langExpToTypeScript(item.expression)}, "${item.listJoin.joinText}", ${joinType}, ${vertical})\}`;
                }
            } else {
                if (myElem.isOptional) { // surround the unparse call with an if-statement, because the element may not be present
                    result += `\$\{${langExpToTypeScript(item.expression)} ? \``;
                }
                if (myElem.isPart) {
                    result += `\$\{this.unparse(${langExpToTypeScript(item.expression)})\}`;
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

