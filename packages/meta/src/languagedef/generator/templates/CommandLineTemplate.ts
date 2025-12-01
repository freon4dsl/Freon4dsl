import { FreMetaLanguage } from "../../metalanguage/index.js";
import { Imports, Names } from "../../../utils/on-lang/index.js"

export class CommandLineTemplate {
    generateCommandLine(): string {
        return `// TEMPLATE: CommandLineTemplate.generateCommandLine() 
            import { CommandLineFlagParameter, CommandLineParser } from "@rushstack/ts-command-line";

            export class FreonCommandLine extends CommandLineParser {
                private verboseArg!: CommandLineFlagParameter;
            
                public constructor() {
                    super({
                        toolFilename: "lionweb",
                        toolDescription: "Freon toolset for playing with LionWeb."
                    });

                    this.verboseArg = this.defineFlagParameter({
                        parameterLongName: "--verbose",
                        parameterShortName: "-v",
                        description: "Show extra logging detail"
                    });
                }
            
                protected async onExecute(): Promise<void> {
                    try {
                        await super.onExecute();
                    } catch (e: unknown) {
                        const err = e instanceof Error ? e : new Error(String(e));
                        console.error(\`Exception in onExecute: \${err.message}\\n\${err.stack ?? ""}\`);
                        throw err;
                    }
                }
            }`;
    }

    generateEmptyAction(): string {
        return `import { CommandLineAction, CommandLineStringParameter } from "@rushstack/ts-command-line";
            
            export class DummyAction extends CommandLineAction {
                dummyParameter!: CommandLineStringParameter;
            
                constructor() {
                    super({
                        actionName: "template-action",
                        summary: "My description",
                        documentation:
                            "More description"
                    });

                    this.dummyParameter = this.defineStringParameter({
                        argumentName: "DUMMY_PARAMETER",
                        defaultValue: "dummy.value",
                        parameterLongName: "--dummy",
                        parameterShortName: "-d",
                        description: "Dummy parameter, create your own"
                    });
                }
            
                protected onExecute(): Promise<void> {
                    const self = this;
                    return new Promise(function (resolve, rejest) {
                        const result = self.dummyAction();
                    });
                }
            
                async dummyAction(): Promise<string> {
                    return "Hello World";
                }
            
            }`;
    }

    // @ts-ignore
    generateCommandLineRunner(language: FreMetaLanguage, relativePath: string): string {
        const imports = new Imports(relativePath)
        imports.root.add(Names.LanguageEnvironment);

        return `// TEMPLATE: CommandLineTemplate.generateCommandLineRunner()
            // Run this as the main program.
            ${imports.makeImports(language)}
            import { FreonCommandLine } from "${relativePath}/commandline/gen/FreonCommandLine.js";
            import { DummyAction } from "${relativePath}/commandline/gen/DummyAction.js";
            
            // ensure language is initialized
            const tmp = ${Names.LanguageEnvironment}.getInstance();
            
            // Create the command line object
            const cli: FreonCommandLine = new FreonCommandLine();
            
            // Add specific actions to the command line tool
            // REPLACE WITH YOUR OWN
            cli.addAction(new DummyAction());
            
            // Run it
            cli.executeAsync();`;
    }
}
