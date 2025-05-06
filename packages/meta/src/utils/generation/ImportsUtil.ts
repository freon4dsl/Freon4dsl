import { Names } from "./Names.js"

export class ImportsUtil {
    /**
     * All the types and interfaces exported from Freon core and core-svelte.
     */
    static TypesAndInterfaces: Set<string> = new Set<string>([
        "FreNode",
        "FreNamedNode",
        "FreModel",
        "FreModelUnit",
        "FreBinaryExpression",
        "FreExpressionNode",
        "FreModelUnit",
        "FreAction",
        "FreScoper",
        "FreStdLib",
        "FreType",
        "FreTyper",
        "FreValidator",
        "FreRerader",
        "FreWriter",
        "FreInterpreter",
        "IMainInterpreter",
        "FreEnvironment",
        "FreProjection",
        "SelectOption",
        "SelectedOption",
    ])

    /**
     * Return the import text for class, type or interface `name`.
     * @param name
     */
    static imports(name: string): string {
        return (this.TypesAndInterfaces.has(name) || this.TypesAndInterfaces.has(Names.startWithLowerCase(name))) ? `type ${name}` : name
    }
}
