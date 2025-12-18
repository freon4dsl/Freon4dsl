import type { FreMetaLanguage } from "../../languagedef/metalanguage/index.js"
import { Names } from "./Names.js"
import { EDITOR_FOLDER, FREON_CORE, LANGUAGE_FOLDER, LANGUAGE_UTILS_FOLDER, TYPER_CONCEPTS_FOLDER } from "./PathProvider.js"

/**
 * All the types and interfaces exported from Freon core and core-svelte.
 */
const TypesAndInterfaces: Set<string> = new Set<string>([
    "FreNode",
    "FreNamedNode",
    "FreOwnerDescriptor",
    "FreModel",
    "FreModelUnit",
    "FreBinaryExpression",
    "FreExpressionNode",
    "FreModelUnit",
    "FreAction",
    "FreCombinedActions",
    "FreTableDefinition",
    "FreTriggerType",
    "FreScoper",
    "FreStdlib",
    "FreType",
    "FreTyper",
    "FreValidator",
    "FreReader",
    "FreWriter",
    "FreKey",
    "FreInterpreter",
    "IMainInterpreter",
    "ConceptFunction",
    "OwningPropertyFunction",
    "FreEnvironment",
    "FreProjection",
    "SelectOption",
    "SelectedOption",
    "FreLanguageModel",
    "FreLanguageModelUnit",
    "FreLanguageProperty",
    "FreLanguageConcept",
    "FreLanguageInterface",
])

/**
 * Class to hold all imports for a generated file
 * and make thge import statements for them.
 */
export class Imports {
    /**
     * Imports from various packages and folders.
     */
    core = new Set<string>()
    language = new Set<string>()
    root = new Set<string>()
    typer = new Set<string>()
    editor = new Set<string>()
    utils = new Set<string>()
    
    relativePath: string
    
    constructor(relativePath?: string) {
        this.relativePath = (relativePath ? relativePath : "")
    }
    
    reset(): void {
        this.core = new Set<string>()
        this.language = new Set<string>()
        this.root = new Set<string>()
        this.typer = new Set<string>()
        this.editor = new Set<string>()
        this.utils = new Set<string>()
    }

    /**
     * Make the import statements.
     * @param metaLanguage
     */
    // @ts-ignore
    makeImports(metaLanguage: FreMetaLanguage): string {
        return this.makeCoreImportStatements() +
        this.makeLanguageImportStatements() +
        this.makeTyperImportStatements() +
        this.makeConfigImportStatements() +
        this.makeEditorImportStatements() +
        this.makeUtilsImportStatements()
        // Etc.
    }

    private makeCoreImportStatements(): string {
        return this.makeImportStatement(this.core, FREON_CORE)
    }

    private makeLanguageImportStatements(): string {
        const fromPath = (this.relativePath === "" ? "./internal.js" : `${this.relativePath}/${LANGUAGE_FOLDER}/index.js`)
        return this.makeImportStatement(this.language, fromPath)
    }

    private makeTyperImportStatements(): string {
        const fromPath = (this.relativePath === "" ? "./internal.js" : `${this.relativePath}/${TYPER_CONCEPTS_FOLDER}/index.js`)
        return this.makeImportStatement(this.typer, fromPath)
    }

    private makeConfigImportStatements(): string {
        const fromPath = (this.relativePath === undefined ? "./internal.js" : `${this.relativePath}/index.js`)
        return this.makeImportStatement(this.root, fromPath)
    }

    private makeEditorImportStatements(): string {
        const fromPath = (this.relativePath === undefined ? "./internal.js" : `${this.relativePath}/${EDITOR_FOLDER}/index.js`)
        return this.makeImportStatement(this.editor, fromPath)
    }

    private makeUtilsImportStatements(): string {
        const fromPath = (this.relativePath === undefined ? "./internal.js" : `${this.relativePath}/${LANGUAGE_UTILS_FOLDER}/index.js`)
        return this.makeImportStatement(this.utils, fromPath)
    }

    private makeImportStatement(importSet: Set<string>, fromPath: string): string {
        return `
            ${
            importSet.size > 0
                ? `import { ${importSet
                    .values()
                    .toArray()
                    .map((imp) => this.imports(imp))
                    .join(", ")} } from "${fromPath}";`
                : ""
        }`
    }

    /**
     * Returns `type name` if needed.
     * @param name
     * @private
     */
    private imports(name: string): string {
        return TypesAndInterfaces.has(name) || TypesAndInterfaces.has(Names.startWithLowerCase(name)) ? `type ${name}` : name
    }

    public makeExportStatements(modelImports: Set<string>): string {
        return `
            ${
            modelImports.size > 0
                ? `export { ${modelImports
                    .values()
                    .toArray()
                    .map((imp) => this.imports(imp))
                    .join(",\n    ")} } from "./internal.js";`
                : ""
        }
            `
    }

    /**
     * Add all language specific types and interfaces to the `TypesAndInterfaces` list.
     * @param language
     */
    static initialize(language: FreMetaLanguage): void {
        TypesAndInterfaces
            .add(Names.checkerInterface(language))
            .add(Names.interpreterInterfacename(language))
            .add(Names.workerInterface(language))
        for (const intface of language.interfaces) {
            TypesAndInterfaces.add(Names.interface(intface))
        }
    }
}
