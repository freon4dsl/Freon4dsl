import { BinaryExpressionRule, GrammarModel } from "./grammarModel/index.js";
import { FreMetaClassifier } from "../../languagedef/metalanguage/index.js";
import { LANGUAGE_GEN_FOLDER, Names } from "../../utils/index.js";

export class ReaderHelperTemplate {
    /**
     * Returns a string representation of a series of helper functions for the reader.
     */
    public generate(grammarModel: GrammarModel, relativePath: string): string {
        let result: string =`import {FreNodeReference, FreParseLocation} from "@freon4dsl/core";
            import {LocationRange} from "peggy";
            
            /**
             * A number of helper functions used by the generated parser.
             */
            
            let currentFileName: string = "UNKNOWN_FILE";
            export function setCurrentFileName(newName: string) {
                currentFileName = newName;
            }
            export function resetCurrentFileName() {
                currentFileName = "UNKNOWN_FILE";
            }
            
            /**
             * Transforms the location information from the peggy parser into the location information used in Freon.
             * @param data peggy location
             */
            export function pegLocationToFreLocation(data: LocationRange): FreParseLocation {
                let line: number = 0;
                if (!!data.start.line) {
                    line = data.start.line;
                }
                let column: number = 0;
                if (!!data.start.column) {
                    column = data.start.column;
                }
                const result: FreParseLocation = FreParseLocation.create({
                    filename: currentFileName,
                    line: line,
                    column: column
                });
                return result;
            }
            
            /**
             * Creates a list of FreNodeReferences from an array of arrays of strings, which is the type that is returned 
             * by the peggy parser.
             * @param data the array of arrays of strings
             * @param type the type of nodes that the references should refer to
             */
            export function createReferenceList(data: Object, type: string): FreNodeReference<any>[] {
                const result: FreNodeReference<any>[] = [];
                if (!!data) {
                    if (Array.isArray(data)) {
                        data.forEach(xx => {
                            if (Array.isArray(xx)) {
                                result.push(FreNodeReference.create(xx, type));
                            }
                        })
                    }
                }
                return result;
            }
            `;
        // add helper function(s) for binary expressions
        const imports: FreMetaClassifier[] = [];
        grammarModel.parts.forEach(part => {
            part.rules.forEach(rule => {
                if (rule instanceof BinaryExpressionRule) {
                    result += rule.toMethod();
                    imports.push(...rule.helperImports())
                }
            })
        });
        // add the extra imports needed for the binary expression function(s)
        let importStr: string = '';
        if (imports.length > 1) {
            importStr += `import { ${imports.map(imp => `${Names.classifier(imp)}`).join(", ")} } from "${relativePath}/${LANGUAGE_GEN_FOLDER}";\n`;
        }
        return importStr + result;
    }
}
