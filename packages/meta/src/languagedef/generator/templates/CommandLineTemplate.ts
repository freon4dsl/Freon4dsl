import { FreMetaLanguage } from "../../metalanguage/index.js";
import { Names, CONFIGURATION_GEN_FOLDER } from "../../../utils/index.js";

export class CommandLineTemplate {
    generateCommandLine(): string {
        return `import { CommandLineFlagParameter, CommandLineParser } from "@rushstack/ts-command-line";

            export class FreonCommandLine extends CommandLineParser {
                private verboseArg: CommandLineFlagParameter;
            
                public constructor() {
                    super({
                        toolFilename: "lionweb",
                        toolDescription: "Freon toolset for playing with LionWeb."
                    });
                }
            
                protected onDefineParameters(): void {
                    this.verboseArg = this.defineFlagParameter({
                        parameterLongName: "--verbose",
                        parameterShortName: "-v",
                        description: "Show extra logging detail"
                    });
                }
            
                protected onExecute(): Promise<void> {
                    try {
                        return super.onExecute();
                    } catch (e) {
                        console.error("Exception in onExecute: " + e.message + "\\n" + e.stack);
                    }
                    return null;
                }
            }`;
    }

    generateEmptyAction(): string {
        return `import { CommandLineAction, CommandLineStringParameter } from "@rushstack/ts-command-line";
            
            export class DummyAction extends CommandLineAction {
                dummyParameter: CommandLineStringParameter;
            
                constructor() {
                    super({
                        actionName: "template-action",
                        summary: "My description",
                        documentation:
                            "More description"
                    });
                }
            
                protected onDefineParameters(): void {
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

    generateCommandLineRunner(language: FreMetaLanguage): string {
        const configImports = [];
        configImports.push(Names.environment(language));

        return `// Run this as the main program.
            ${
                configImports.length > 0
                    ? configImports.map((c) => `import { ${c} } from "../${CONFIGURATION_GEN_FOLDER}/${c}.js";`)
                    : ``
            }
            import { FreonCommandLine } from "./FreonCommandLine.js";
            import { DummyAction } from "./DummyAction.js";
            
            // ensure language is initialized
            const tmp = ${Names.environment(language)}.getInstance();
            
            // Create the command line object
            const cli: FreonCommandLine = new FreonCommandLine();
            
            // Add specific actions to the command line tool
            // REPLACE WITH YOUR OWN
            cli.addAction(new DummyAction());
            
            // Run it
            cli.execute();`;
    }
}
