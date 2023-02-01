import { PiLanguage } from "../../../languagedef/metalanguage";
import { Names } from "../../../utils/index";
import { PiInterpreterDef } from "../../metalanguage/PiInterpreterDef";

export class InterpreterMainTemplate {

    constructor() {
    }

    /**
     * The base class containing all interpreter functions that should be defined.
     * @param language
     * @param interpreterDef
     */
    public interpreterMain(language: PiLanguage, interpreterDef: PiInterpreterDef): string {
        return `// Generated my Freon, will be overwritten with every generation.
        import {
            ConceptFunction, FreonInterpreter,
            IMainInterpreter,
            InterpreterContext,
            InterpreterTracer,
            MainInterpreter, OwningPropertyFunction, PiElement, RtObject, RtError
        } from "@projectit/core";
        import {  ${Names.interpreterInitname(language)} } from "./gen/${Names.interpreterInitname(language)}";
        
        const getPropertyFunction: OwningPropertyFunction = (node: Object) => {
            const index = (node as PiElement).piOwnerDescriptor().propertyIndex;
            return (node as PiElement).piOwnerDescriptor().propertyName + (index !== undefined ? "[" + index + "]" : "");
        };

        /**
         * Function that returns the concept name for \`node\`.
         * Used by the interpreter to find which evaluator should be use for each node.
         */
        const getConceptFunction: ConceptFunction = (node: Object) => {
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
        export class ${Names.interpreterName(language)} implements FreonInterpreter{
            private static  main: IMainInterpreter = null;
        
            constructor() {
                if(${Names.interpreterName(language)}.main === null) {
                    ${Names.interpreterName(language)}.main = MainInterpreter.instance(${Names.interpreterInitname(language)}, getConceptFunction, getPropertyFunction);
                }
            }
        
            setTracing(value: boolean) {
                ${Names.interpreterName(language)}.main.setTracing(value);
            }
        
            getTrace(): InterpreterTracer {
                return ${Names.interpreterName(language)}.main.getTrace()
            }
        
            evaluate(node: Object): RtObject {
                ${Names.interpreterName(language)}.main.reset();
                try {
                    return ${Names.interpreterName(language)}.main.evaluate(node, InterpreterContext.EMPTY_CONTEXT);
                } catch (e: any) {
                    return new RtError(e.message);
                }
            }
        }
        `
    }

}
