import { langRefToTypeScript, LANGUAGE_GEN_FOLDER, Names } from "../../../utils";
import { PiLangBinaryExpressionConcept, PiLangClass, PiLangConcept, PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
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

export class UnparserTemplate {
    constructor() {
    }

    generateUnparser(language: PiLanguageUnit, editDef: DefEditorLanguage, relativePath: string): string {
        const allLangConcepts : string = Names.allConcepts(language);   
        const generatedClassName : String = Names.unparser(language);
        // TODO change comment before class

        // Template starts here 
        return `
        import { ${allLangConcepts} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${language.classes.map(concept => `
                ${concept.name}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";     
        import { ${language.enumerations.map(concept => `
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
                ${sortClasses(language.classes).map(concept => `
                if(modelelement instanceof ${concept.name}) {
                    console.log("found a ${concept.name}");
                    return this.unparse${concept.name}(modelelement);
                }`).join("")}
                ${language.enumerations.map(concept => `
                if(modelelement instanceof ${concept.name}) {
                    return this.unparse${concept.name}(modelelement);
                }`).join("")}
            }

            ${editDef.conceptEditors.map(conceptDef => `${this.makeConceptMethod(conceptDef)}`).join("\n")}
            ${language.enumerations.map(concept => `
                private unparse${concept.name}(modelelement: ${concept.name}) : string {
                    return "";
                }`).join("\n")}
                        
            private unparseList(list: AllDemoConcepts[], sepText: string, sepType: SeparatorType, vertical: boolean) : string {
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
        } `;
    }

    makeConceptMethod (conceptDef: DefEditorConcept ) : string {
        console.log("creating unparse method for concept " + conceptDef.concept.name + ", editDef: " + (conceptDef.projection? conceptDef.projection.toString() : conceptDef.symbol));
        let myConcept: PiLangConcept = conceptDef.concept.referedElement();
        let name: string = myConcept.name;
        let lines: MetaEditorProjectionLine[] = conceptDef.projection?.lines;

        if (!!lines) {
            return `
                private unparse${name}(modelelement: ${name}) : string {
                    return "${lines.map(line => `${this.makeLine(line)}` ).join("\\n")}"
                }`
        } else {
            if (myConcept instanceof  PiLangBinaryExpressionConcept && !!(conceptDef.symbol)) {
                return `private unparse${name}(modelelement: ${name}) : string {
                    return this.unparse(modelelement.left) + "${conceptDef.symbol}" + this.unparse(modelelement.right);
                }`
            }
            if (myConcept instanceof  PiLangClass && myConcept.isAbstract) {
                return `private unparse${name}(modelelement: ${name}) : string {
                    return "'unparse' should be implemented by subclasses of ${myConcept.name}";
                }`
            }
            // for now an empty method, when the default editDef contains a projection
            // for every concept, this will no longer be used
            return `private unparse${name}(modelelement: ${name}) : string {
                    return "";
                }`
        }
    }

    private makeLine (line : MetaEditorProjectionLine) : string {
        // the result should be text or should end in a quote
        let result: string = "";
        for (var _i = 0; _i < line.indent; _i++) {
            result = result + " ";
        }
        for (let item of line.items) {
            if (item instanceof DefEditorProjectionText) {
                result = result + `${item.text}`;
            }
            if (item instanceof DefEditorSubProjection) {
                let myElem = item.expression.findRefOfLastAppliedFeature();
                let type = myElem.type.referedElement();
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
                        result = result + `\" + this.unparseList(${langRefToTypeScript(item.expression)}, "${item.listJoin.joinText}", ${joinType}, ${vertical}) + \"`;
                    } else {
                        result = result + `\" + this.unparse(${langRefToTypeScript(item.expression)}) + \"`;
                    }
                } else {
                    // the expression is of primitive type
                    if (myElem.isList) {
                        result = result + `\" + ${langRefToTypeScript(item.expression)}.map(listElem => {
                                    ${langRefToTypeScript(item.expression)}
                                }) + \"`;
                    } else {
                        result = result + `\" + ${langRefToTypeScript(item.expression)} + \"`;
                    }
                }
            }
            if (item instanceof DefEditorProjectionExpression) {
                // TODO implement this
                // console.log(item)
            }
            if (item instanceof DefEditorProjectionIndent) {
                // TODO implement this
            }
        }
        return result;
    }
}

