import { PiLanguage } from "../../../languagedef/metalanguage";
import { Names } from "../../../utils/index";
import { PiInterpreterDef } from "../../metalanguage/PiInterpreterDef";

export class InterpreterMainTemplate {
    constructor() {}

    /**
     * The base class containing all interpreter functions that should be defined.
     * @param language
     * @param interpreterDef
     */
    public interpreterMain(language: PiLanguage, interpreterDef: PiInterpreterDef): string {
        const AST_TYPE = interpreterDef.astType;
        const RT_TYPE = interpreterDef.runtimeType;

        return `// Generated my Freon, will be overwritten with every generation.
        import {
            FreonInterpreter,
            InterpreterContext,
            MainInterpreter, PiElement, RtObject, RtError
        } from "@projectit/core";
        import {  ${Names.interpreterInitname(language)} } from "./gen/${Names.interpreterInitname(language)}";
        import { 
            ${Names.interpreterOwningPropertyFunction(language)}, 
            ${Names.interpreterConceptFunction(language)},
            ${Names.mainInterpreterInterface(language)},
            ${Names.interpreterTracer(language)}
        } from "./gen/${Names.interpreterTypesname(language)}";
        
        const getPropertyFunction: ${Names.interpreterOwningPropertyFunction(language)} = (node: Object) => {
            const index = (node as PiElement).piOwnerDescriptor().propertyIndex;
            return (node as PiElement).piOwnerDescriptor().propertyName + (index !== undefined ? "[" + index + "]" : "");
        };

        /**
         * Function that returns the concept name for \`node\`.
         * Used by the interpreter to find which evaluator should be use for each node.
         */
        const getConceptFunction: ${Names.interpreterConceptFunction(language)} = (node: Object) => {
            if(node === undefined) {
                return "";
            }
            return (node as PiElement).piLanguageConcept();
        }

        /**
         * The facade around the actual interpreter to avoid improper usage.
         * Sets the functions used to access the expression tree.
         * Ensures all internal interpreter state is cleaned when creating a new instance.
         */
        export class ${Names.interpreterName(language)} implements FreonInterpreter<${AST_TYPE}, ${RT_TYPE}>{
            private static  main: ${Names.mainInterpreterInterface(language)} = null;
        
            constructor() {
                if(${Names.interpreterName(language)}.main === null) {
                    ${Names.interpreterName(language)}.main = MainInterpreter.instance(${Names.interpreterInitname(
            language
        )}, getConceptFunction, getPropertyFunction);
                }
            }
        
            setTracing(value: boolean) {
                ${Names.interpreterName(language)}.main.setTracing(value);
            }
        
            getTrace(): ${Names.interpreterTracer(language)} {
                return ${Names.interpreterName(language)}.main.getTrace()
            }
        
            evaluate(node: ${AST_TYPE}): ${RT_TYPE} {
                ${Names.interpreterName(language)}.main.reset();
                try {
                    return ${Names.interpreterName(language)}.main.evaluate(node, InterpreterContext.EMPTY_CONTEXT);
                } catch (e: any) {
                    return new RtError(e.message);
                }
            }
        }
        `;
    }
}
