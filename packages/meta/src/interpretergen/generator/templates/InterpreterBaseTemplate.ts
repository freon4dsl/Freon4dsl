import { FreLanguage } from "../../../languagedef/metalanguage";
import { Names } from "../../../utils/index";
import { FreInterpreterDef } from "../../metalanguage/FreInterpreterDef";

export class InterpreterBaseTemplate {

    /**
     * The base class containing all interpreter functions that should be defined.
     * @param language
     * @param interpreterDef
     */
    public interpreterBase(language: FreLanguage, interpreterDef: FreInterpreterDef): string {
        return `// Generated my Freon, will be overwritten with every generation.
        import { InterpreterContext, RtObject, RtError } from "@freon4dsl/core";
        import { ${interpreterDef.conceptsToEvaluate.map(c => Names.concept(c)).join(",")} } from "../../language/gen";

        /**
         * The base class containing all interpreter functions that should be defined.
         * All functions throw an error when called.
         */
        export class ${Names.interpreterBaseClassname(language)} {

            constructor() {}

            ${interpreterDef.conceptsToEvaluate.map(c =>
                `eval${Names.concept(c)} (node: ${Names.concept(c)} , ctx: InterpreterContext): RtObject {
                    throw new RtError("eval${Names.concept(c)} is not defined");
                }`
            ).join("\n\n")}
        }
        `;
    }

    public interpreterClass(language: FreLanguage, interpreterDef: FreInterpreterDef): string {
        const baseName = Names.interpreterBaseClassname(language);
        return `// Generated my Freon once, will NEVER be overwritten.
        import { InterpreterContext, IMainInterpreter, RtObject } from "@freon4dsl/core";
        import { ${baseName} } from "./gen/${baseName}";

        let main: IMainInterpreter;

        /**
         * The class containing all interpreter functions twritten by thge language engineer.
         * This class is initially empty,  and will not be overwritten if it already exists..
         */
        export class ${Names.interpreterClassname(language)} extends ${baseName} {

            constructor(m: IMainInterpreter) {
                super();
                main = m;
            }
        }
        `;
    }

    public interpreterInit(language: FreLanguage, interpreterDef: FreInterpreterDef): string {
        const interpreter = Names.interpreterClassname(language);
        return `import { IMainInterpreter } from "@freon4dsl/core";
        import { ${interpreter} } from "../${interpreter}";

        /**
         * The class that registers all interpreter function with the main interpreter.
         */
        export function ${Names.interpreterInitname(language)}(main: IMainInterpreter) {
            const interpreter = new ${interpreter}(main);

            ${interpreterDef.conceptsToEvaluate.map(c => {
                return `main.registerFunction("${Names.concept(c)}", interpreter.eval${Names.concept(c)});`;
            }).join("\n")} // DONE

        }`;
    }

}
