import { CommandLineStringParameter } from "@microsoft/ts-command-line";
import { EditorGenerator } from "../generator/editor/EditorGenerator";
import { LanguageGenerator } from "../generator/language/LanguageGenerator";
import { ScoperGenerator } from "../generator/scoper/ScoperGenerator";
import { EditorParser } from "../parser/editor/EditorParser";
import { LanguageParser } from "../parser/language/LanguageParser";
import { ScoperParser } from "../parser/scoper/ScoperParser";
import { ProjectItGenerateAction } from "./ProjectitGenerateAction";

export class ProjectItGenerateScoper extends ProjectItGenerateAction {
    private scopeFile: CommandLineStringParameter;
    protected languageGenerator: LanguageGenerator = new LanguageGenerator();
    protected scoperGenerator: ScoperGenerator = new ScoperGenerator();

    public constructor() {
        super({
            actionName: "generate-scoper",
            summary: "Generates the typeScript code for the scoper for your language",
            documentation: "Generates TypeScript code for the scoper of language defined in the .lang file."
        });
    }

    generate(): void {
        const language = new LanguageParser().parse(this.languageFile);
        this.languageGenerator.outputfolder = this.outputFolder;
        this.languageGenerator.generate(language);

        const editor = new ScoperParser().parse(this.scopeFile.value);
        this.scoperGenerator.outputfolder = this.outputFolder;
        this.scoperGenerator.language = language;
        this.scoperGenerator.generate(editor);
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
