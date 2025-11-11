import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { Imports, INTERPRETER_FOLDER, Names } from '../../../utils/on-lang/index.js';

export class InterpreterMainTemplate {
    /**
     * The base class containing all interpreter functions that should be defined.
     * @param language
     */
    public interpreterMain(language: FreMetaLanguage, relativePath: string): string {
        const imports = new Imports("../../")
        imports.core = new Set<string>([
            "ConceptFunction", Names.FreInterpreter,
            "IMainInterpreter",
            "InterpreterContext",
            "InterpreterTracer",
            "MainInterpreter", "OwningPropertyFunction", Names.FreNode, "RtObject", "RtError"
        ])

        return `// TEMPLATE: InterpreterBaseTemplate.interpreterInit(...)
        // Will be overwritten with every generation.
        ${imports.makeImports(language)}
        import {  ${Names.interpreterInitname(language)} } from "${relativePath}${INTERPRETER_FOLDER}/gen/${Names.interpreterInitname(language)}.js";

        const getPropertyFunction: OwningPropertyFunction = (node: Object) => {
            const index = (node as ${Names.FreNode}).freOwnerDescriptor().propertyIndex;
            return (node as ${Names.FreNode}).freOwnerDescriptor().propertyName + (index !== undefined ? "[" + index + "]" : "");
        };

        /**
         * Function that returns the concept name for \`node\`.
         * Used by the interpreter to find which evaluator should be use for each node.
         */
        const getConceptFunction: ConceptFunction = (node: Object) => {
            if(node === undefined) {
                return "";
            }
            return (node as ${Names.FreNode}).freLanguageConcept();
        }

        /**
         * The facade around the actual interpreter to avoid improper usage.
         * Sets the functions used to access the expression tree.
         * Ensures all internal interpreter state is cleaned when creating a new instance.
         */
        export class ${Names.interpreterName(language)} implements ${Names.FreInterpreter}{
            private static main: IMainInterpreter | null = null;
         
            constructor() {
                ${Names.interpreterName(language)}.getMain();
            }
        
            private static getMain(): IMainInterpreter {
                return this.main ??= MainInterpreter.instance(${Names.interpreterInitname(language)}, getConceptFunction, getPropertyFunction);
            }

            setTracing(value: boolean) {
                ${Names.interpreterName(language)}.getMain().setTracing(value);
            }

            getTrace(): InterpreterTracer {
                return ${Names.interpreterName(language)}.getMain().getTrace()
            }

            evaluate(node: Object): RtObject {
                return this.evaluateWithContext(node, InterpreterContext.EMPTY_CONTEXT)
            }
            
            evaluateWithContext(node: Object, ctx: InterpreterContext): RtObject {
                ${Names.interpreterName(language)}.getMain().reset();
                try {
                    return ${Names.interpreterName(language)}.getMain().evaluate(node, ctx);
                } catch (e: any) {
                    return new RtError(e.message);
                }
            }
        }
        `;
    }
}
