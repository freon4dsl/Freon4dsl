import { PiLanguage } from "../../../languagedef/metalanguage";
import { Names } from "../../../utils/index";
import { PiInterpreterDef } from "../../metalanguage/PiInterpreterDef";

export class InterpreterTypesTemplate {
    constructor() {}

    /**
     * The base class containing all interpreter functions that should be defined.
     * @param language
     * @param interpreterDef
     */
    public interpreterTypes(language: PiLanguage, interpreterDef: PiInterpreterDef): string {
        const lname = language.name;
        const AST_TYPE = interpreterDef.astType;
        const RT_TYPE = interpreterDef.runtimeType;

        return `// Generated my Freon (InterpreterTypesTemplate), will be overwritten with every generation.
            // shorthands
            import {
                ConceptFunction,
                EvaluateFunction,
                IMainInterpreter,
                InitFunction,
                InterpreterContext,
                InterpreterTracer,
                OwningPropertyFunction,
                PiElement,
                RtObject,
            } from "@projectit/core";
            
            /**
             * Define all non-generic types / classes / interfaces for Example language
             */
            export type ${Names.mainInterpreterInterface(language)} = IMainInterpreter<${AST_TYPE}, ${RT_TYPE}>;
            export class InterpreterBase<A, R> {}
            export type ${Names.interpreterTracer(language)} = InterpreterTracer<${AST_TYPE}, ${RT_TYPE}>;
            export type ${lname}InitFunction = InitFunction<${AST_TYPE}, ${RT_TYPE}>;
            export type ${Names.interpreterConceptFunction(language)} = ConceptFunction<${AST_TYPE}>;
            export type ${Names.interpreterOwningPropertyFunction(language)} = OwningPropertyFunction<${AST_TYPE}>;
            export type ${lname}EvaluateFunction = EvaluateFunction<${AST_TYPE}, ${RT_TYPE}>;
            export class ${Names.interpreterContext(language)} extends InterpreterContext<${AST_TYPE}, ${RT_TYPE}> {}
        `;
    }
}
