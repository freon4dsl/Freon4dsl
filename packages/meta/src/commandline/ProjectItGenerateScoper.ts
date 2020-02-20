import { CommandLineStringParameter } from "@microsoft/ts-command-line";
import { ProjectItGenerateAction } from "./ProjectitGenerateAction";

export class ProjectItGenerateScoper extends ProjectItGenerateAction {
    private scopeFile: CommandLineStringParameter;

    public constructor() {
        super({
            actionName: "generate-scoper",
            summary: "Generates the typeScript code for the scoper for your language",
            documentation: "Generates TypeScript code for the scoper of language defined in the .lang file."
        });
    }

    generate(): void {
        console.log("Scope definition file is ["+ this.scopeFile.defaultValue + "]");
    }

    protected onDefineParameters(): void {
        this.scopeFile = this.defineStringParameter({
            argumentName: "SCOPE",
            defaultValue: "LanguageScoper.edit",
            parameterLongName: "--scope",
            parameterShortName: "-s",
            description: "Scope Definition file"
        });
    }
}
