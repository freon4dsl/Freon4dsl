import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { Imports, Names } from "../../../utils/index.js"
import { FreInterpreterDef } from "../../metalanguage/FreInterpreterDef.js";

export class InterpreterBaseTemplate {
    /**
     * The base class containing all interpreter functions that should be defined.
     * @param language
     * @param interpreterDef
     */
    public interpreterBase(language: FreMetaLanguage, interpreterDef: FreInterpreterDef, relativePath: string): string {
        const imports = new Imports(relativePath)
        imports.core = new Set<string>(["InterpreterContext", "RtObject", "RtError"])
        imports.language = new Set<string>(interpreterDef.conceptsToEvaluate.map((c) => Names.classifier(c)))

        return `// TEMPLATE: InterpreterBaseTemplate.interpreterBase(...)
        // Will be overwritten with every generation.
        ${imports.makeImports((language))}

        /**
         * The base class containing all interpreter functions that should be defined.
         * All functions throw an error when called.
         */
        export class ${Names.interpreterBaseClassname(language)} {

            constructor() {}

            ${interpreterDef.conceptsToEvaluate
                .map(
                    (c) =>
                        `eval${Names.classifier(c)} (node: ${Names.classifier(c)} , ctx: InterpreterContext): RtObject {
                    throw new RtError("eval${Names.classifier(c)} is not defined");
                }`,
                )
                .join("\n\n")}
        }
        `;
    }

    public interpreterClass(language: FreMetaLanguage, relativePath: string): string {
        const imports = new Imports(relativePath)
        imports.core = new Set<string>(["InterpreterContext", "RtObject", "IMainInterpreter"])

        const baseName = Names.interpreterBaseClassname(language);
        return `// TEMPLATE: InterpreterBaseTemplate.interpreterClass(...)
        // Generated once, will NEVER be overwritten.
        ${imports.makeImports(language)}
        import { ${baseName} } from "./gen/${baseName}.js";

        let main: IMainInterpreter;

        /**
         * The class containing all interpreter functions written by the language engineer.
         * This class is initially empty, and will not be overwritten if it already exists.
         */
        export class ${Names.interpreterClassname(language)} extends ${baseName} {

            constructor(m: IMainInterpreter) {
                super();
                main = m;
            }
        }
        `;
    }

    public interpreterInit(language: FreMetaLanguage, interpreterDef: FreInterpreterDef): string {
        const interpreter = Names.interpreterClassname(language);
        return `
        // TEMPLATE: InterpreterBaseTemplate.interpreterInit(...)
        import { type IMainInterpreter } from "@freon4dsl/core";
        import { ${interpreter} } from "../${interpreter}.js";

        /**
         * The class that registers all interpreter function with the main interpreter.
         */
        export function ${Names.interpreterInitname(language)}(main: IMainInterpreter) {
            const interpreter = new ${interpreter}(main);

            ${interpreterDef.conceptsToEvaluate
                .map((c) => {
                    return `main.registerFunction("${Names.classifier(c)}", interpreter.eval${Names.classifier(c)});`;
                })
                .join("\n")} // DONE

        }`;
    }
}
