import { Names, LANGUAGE_GEN_FOLDER, langRefToTypeScript } from "../../../utils";
import { PiLanguageUnit, PiLangClass, PiLangProperty, PiLangElement } from "../../../languagedef/metalanguage/PiLanguage";
import { sortClasses } from "../../../utils/ModelHelpers";
import {
    DefEditorConcept,
    DefEditorLanguage, DefEditorProjectionExpression, DefEditorProjectionIndent,
    DefEditorProjectionText,
    DefEditorSubProjection,
    MetaEditorProjectionLine
} from "../../metalanguage";
import * as webpack from "webpack";
import indent = webpack.Template.indent;
import { PiLangElementReference } from "../../../languagedef/metalanguage";

export class UnparserTemplate {
    constructor() {
    }

    generateUnparser(language: PiLanguageUnit, editDef: DefEditorLanguage, relativePath: string): string {
        const allLangConcepts : string = Names.allConcepts(language);   
        const generatedClassName : String = Names.unparser(language);
        // TODO use the editor definition language to create the bodies of the functions


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

        // For now, we generate an empty template class as unparser. 
        // When the editor definition language is finished, the .edit file
        // will be used to generate the bodies of the functions below.
        export class ${generatedClassName}  {

            public unparse(modelelement: ${allLangConcepts}) : string {
                ${sortClasses(language.classes).map(concept => `
                if(modelelement instanceof ${concept.name}) {
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
            }`;
    }

    makeConceptMethod (conceptDef: DefEditorConcept ) : string {
        let name: string = conceptDef.concept.referedElement().name;
        let lines: MetaEditorProjectionLine[] = conceptDef.projection?.lines;

        if (!!lines) {
            // lots of escapes: we need to produce `" + "\n" +"`
            return `private unparse${name}(modelelement: ${name}) : string {
                    return "${lines.map(line => `${this.makeLine(line)}` ).join("\" + \"\\n\" + \"")};"
                }`
        } else {
            // for now an empty method, when the default editDef contains a projection
            // for every concept, this will no longer be used
            return `private unparse${name}(modelelement: ${name}) : string {
                    return "";
                }`
        }
    }

    makeLine (line : MetaEditorProjectionLine) : string {
        let type = "DemoModel";
        let result: string = "";
        for (var _i = 0; _i < line.indent; _i++) {
            result = result + " ";
        }
        for (let item of line.items) {
            if (item instanceof DefEditorProjectionText) {
                result = result + `${item.text}`;
            }
            if (item instanceof DefEditorSubProjection) {

                let type = item.expression.referedElement;
                console.log("working on item " + item.expression.toPiString() + " of type " + type.name);
                if (!!type) {
                    result = result + `\" + this.unparse${type.name}(${langRefToTypeScript(item.expression)}) + \"`;
                } else {
                    result = result + `\" + ${langRefToTypeScript(item.expression)} + \"`;
                }
            }
            if (item instanceof DefEditorProjectionExpression) {
                // result = result + `\" + this.unparse${type}(${langRefToTypeScript(item)}) + \"`;
            }
            if (item instanceof DefEditorProjectionIndent) {
                // TODO implement this
            }
        }

        result = result.replace(/\" + \"/gi, "");
        return result;
    }

}

