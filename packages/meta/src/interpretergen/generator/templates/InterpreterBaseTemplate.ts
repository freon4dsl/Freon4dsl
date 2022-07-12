import { PiLanguage } from "../../../languagedef/metalanguage";
import { Names } from "../../../utils/index";
import { PiInterpreterDef } from "../../metalanguage/PiInterpreterDef";

export class InterpreterBaseTemplate {

    constructor() {
    }

    public interpreterBase(language: PiLanguage, interpreterDef: PiInterpreterDef): string {
        return `import { InterpreterContext } from "@projectit/core";
        import { ${interpreterDef.conceptsToEvaluate.map(c => Names.concept(c)).join(",")} } from "../../language/gen";
        
        export class ${Names.interpreterBaseClassname(language)} {
        
            constructor() {}
            
            ${interpreterDef.conceptsToEvaluate.map(c =>
                `eval${Names.concept(c)} (node: ${Names.concept(c)} , ctx: InterpreterContext): Object {
                    throw Error("eval${Names.concept(c)} is not defined");
                }`
            ).join("\n\n")}
        }
        `
    }

    public interpreterClass(language: PiLanguage, interpreterDef: PiInterpreterDef): string {
        const baseName = Names.interpreterBaseClassname(language);
        return `import { InterpreterContext, IMainInterpreter } from "@projectit/core";
        import { ${baseName} } from "./gen/${baseName}";
        
        let main: IMainInterpreter;
        
        export class ${Names.interpreterClassname(language)} extends ${baseName} {
        
            constructor(m: IMainInterpreter) {
                super();
                main = m;
            }
        }
        `
    }

    public interpreterInit(language: PiLanguage, interpreterDef: PiInterpreterDef): string {
        const interpreter = Names.interpreterClassname(language);
        return `import { IMainInterpreter } from "@projectit/core";
        import { ${interpreter} } from "../${interpreter}";
        
        export function ${Names.interpreterInitname(language)}(main: IMainInterpreter) {
            const interpreter = new ${interpreter}(main);
            
            ${interpreterDef.conceptsToEvaluate.map(c => {
                return `main.registerFunction("${Names.concept(c)}", interpreter.eval${Names.concept(c)});` 
            }).join("\n")} // DONE

        }`
    }

}
